#!/bin/bash

# Colors
RED=31
GREEN=32
BLUE=34

# Function to display colored output
echo_header () {
    COLOR=$1
    MESSAGE=$2
    echo "\e[${COLOR}m\n=======================================================\e[0m"
    echo "\e[${COLOR}m${MESSAGE}\e[0m"
    echo "\e[${COLOR}m=======================================================\e[0m"
}

# Function to handle errors
handle_error () {
    echo_header $RED "Error: $1"
    exit 1
}

cat << "EOF"
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@#*+=================@@@@@%*+=========++*%@@@@@@@
@@@@#-                   .+@@%=.                .+@@@@@
@@@-                   .*@@%-                     .#@@@
@@=     .=+++++++++++*#@@@=       -++++++++++-      %@@
@@.     %@@@@@@@@@@@@@@@+       =%@@@@@@@@@@@@=     +@@
@@.    .@@@@@@@@@@@@@@+.      -%@@@@@@@@@@@@@@+     +@@
@@.    .@@@@@@@@@@@@*.      -#@@#:=@@@@@@@@@@@=     +@@
@@      @@@@@@@@@@#:      :#@@#:  -@@@@@@@@@@@=     +@@
@@#====#@@@@@@@@#-      .*@@@=    -@@@@@@@@@@@=     +@@
@@@@@@@@@@@@@@%-      .*@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@@@@%=       +@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@@@+       =@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@@@+.      -%@@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@@@*.      -%@@@@@@@@@@@#     -@@@@@@@@@@@=     +@@
@@@@@#:      :#@@@@@@@@@@@@@#     -@@@@@@@@@@@+     +@@
@@@#:      :#@@@@@@@@@@@@@@@#     :@@@@@@@@@@@=     +@@
@@=       :+*+++++++++++*%@@@.     :+++++++++-      %@@
@@                       :@@@%.                   .#@@@
@@-                      :@@@@@+:               .+@@@@@
@@@#+===================+%@@@@@@@%*++=======++*%@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
EOF

echo_header $BLUE "                    DATABASE SETUP"

PG_MAIN_VERSION=15
PG_GRAPHQL_VERSION=1.5.1
CARGO_PGRX_VERSION=0.11.2
TARGETARCH=$(dpkg --print-architecture)

# Install PostgresSQL
echo_header $GREEN "Step [1/4]: Installing PostgreSQL..."
apt update -y || handle_error "Failed to update package list."
apt install -y curl || handle_error "Failed to install curl."
apt install -y sudo || handle_error "Failed to install sudo."
apt install build-essential -y || handle_error "Failed to install build-essential."
apt install pkg-config -y || handle_error "Failed to install pkg-config."
apt install libssl-dev -y || handle_error "Failed to install libssl-dev."
apt install libreadline-dev -y || handle_error "Failed to install libreadline-dev."
apt install zlib1g-dev -y || handle_error "Failed to install zlib1g-dev."
apt install unzip -y || handle_error "Failed to install unzip."
apt install libclang-dev -y || handle_error "Failed to install libclang-dev."

# Install pg_graphql extensions
current_directory=$(pwd)
script_directory="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

existing_rust_path=$(which rustc)
if [ -n "$existing_rust_path" ]; then
    echo "Uninstalling existing Rust installation..."
    rm -rf "$existing_rust_path"
fi

# To force a reinstall of cargo-pgrx, pass --force to the command below
curl  https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env" || . "$HOME/.cargo/env"
cargo install --locked cargo-pgrx@$CARGO_PGRX_VERSION --force || handle_error "Failed to install cargo"
cargo pgrx init --pg$PG_MAIN_VERSION download || handle_error "Failed to init postgresql"

# Create a temporary directory
temp_dir=$(mktemp -d)
cd "$temp_dir"

curl -LJO https://github.com/supabase/pg_graphql/archive/refs/tags/v$PG_GRAPHQL_VERSION.zip || handle_error "Failed to download pg_graphql package."

unzip pg_graphql-$PG_GRAPHQL_VERSION.zip

cd "pg_graphql-$PG_GRAPHQL_VERSION"

# Apply patches to pg_graphql files
echo "Applying patches to pg_graphql files..."
for patch_file in "/twenty/patches/pg_graphql/"*.patch; do
    echo "Applying patch: $patch_file"
    patch -p1 < "$patch_file"
done

echo_header $GREEN "Step [2/4]: Building PostgreSQL service..."
cargo pgrx install --release --pg-config /opt/bitnami/postgresql/bin/pg_config || handle_error "Failed to build postgresql"


# Clean up the temporary directory
echo "Cleaning up..."
cd "$current_directory"
rm -rf "$temp_dir"

# Start postgresql service
echo_header $GREEN "Step [3/4]: Starting PostgreSQL service..."
if sudo service postgresql start; then
    echo "PostgreSQL service started successfully."
else
    handle_error "Failed to start PostgreSQL service."
fi

# Run the init.sql to setup database
echo_header $GREEN "Step [4/4]: Setting up database..."
cp ./init.sql /tmp/init.sql
sudo -u postgres psql -f /tmp/init.sql || handle_error "Failed to execute init.sql script."
