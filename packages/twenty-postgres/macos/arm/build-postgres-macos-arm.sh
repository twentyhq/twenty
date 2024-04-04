#!/bin/bash

# Colors
RED=31
GREEN=32
BLUE=34

# Function to display colored output
function echo_header {
    COLOR=$1
    MESSAGE=$2
    echo -e "\e[${COLOR}m\n=======================================================\e[0m"
    echo -e "\e[${COLOR}m${MESSAGE}\e[0m"
    echo -e "\e[${COLOR}m=======================================================\e[0m"
}

# Function to handle errors
function handle_error {
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

current_directory=$(pwd)
script_directory="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

# Install PostgresSQL
echo_header $GREEN "Step [1/4]: Installing PostgreSQL..."

brew reinstall postgresql@$PG_MAIN_VERSION

# Install pg_graphql extensions
echo_header $GREEN "Step [2/4]: Installing GraphQL for PostgreSQL..."

# Uninstall existing Rust installation if found
existing_rust_path=$(which rustc)
if [ -n "$existing_rust_path" ]; then
    echo "Uninstalling existing Rust installation..."
    rm -rf "$existing_rust_path"
fi

# To force a reinstall of cargo-pgrx, pass --force to the command below
curl  https://sh.rustup.rs -sSf | sh
source "$HOME/.cargo/env"
cargo install --locked cargo-pgrx@$CARGO_PGRX_VERSION --force
cargo pgrx init --pg$PG_MAIN_VERSION download

# Create a temporary directory
temp_dir=$(mktemp -d)
cd "$temp_dir"

curl -LJO https://github.com/supabase/pg_graphql/archive/refs/tags/v$PG_GRAPHQL_VERSION.zip || handle_error "Failed to download pg_graphql package."

unzip pg_graphql-$PG_GRAPHQL_VERSION.zip

[[ ":$PATH:" != *":/opt/homebrew/opt/postgresql@$PG_MAIN_VERSION/bin:"* ]] && PATH="/opt/homebrew/opt/postgresql@$PG_MAIN_VERSION/bin:${PATH}"

cd "pg_graphql-$PG_GRAPHQL_VERSION"

# Apply patches to pg_graphql files
echo "Applying patches to pg_graphql files..."
for patch_file in "$script_directory/../../patches/pg_graphql/"*.patch; do
    echo "Applying patch: $patch_file"
    patch -p1 < "$patch_file"
done

cargo pgrx install --release --pg-config /opt/homebrew/opt/postgresql@$PG_MAIN_VERSION/bin/pg_config

# Clean up the temporary directory
echo "Cleaning up..."
cd "$current_directory"
rm -rf "$temp_dir"

# Start postgresql service
echo_header $GREEN "Step [3/4]: Starting PostgreSQL service..."


if brew services start postgresql@$PG_MAIN_VERSION; then
    echo "PostgreSQL service started successfully."
else
    handle_error "Failed to start PostgreSQL service."
fi

# Run the init.sql to setup database
echo_header $GREEN "Step [4/4]: Setting up database..."
cp ./postgres/init.sql /tmp/init.sql
psql -f /tmp/init.sql -d postgres|| handle_error "Failed to execute init.sql script."
