#!/bin/bash

echo "🔧 Checking dependencies..."
if ! command -v docker &>/dev/null; then
  echo -e "\t❌ Docker is not installed or not in PATH. Please install Docker first.\n\t\tSee https://docs.docker.com/get-docker/"
  exit 1
fi
# Check if docker compose plugin is installed
if ! docker compose version &>/dev/null; then
  echo -e "\t❌ Docker Compose is not installed or not in PATH (n.b. docker-compose is deprecated)\n\t\tUpdate docker or install docker-compose-plugin\n\t\tOn Linux: sudo apt-get install docker-compose-plugin\n\t\tSee https://docs.docker.com/compose/install/"
  exit 1
fi
# Check if docker is started
if ! docker info &>/dev/null; then
  echo -e "\t❌ Docker is not running.\n\t\tPlease start Docker Desktop, Docker or check documentation at https://docs.docker.com/config/daemon/start/"
  exit 1
fi
if ! command -v curl &>/dev/null; then
  echo -e "\t❌ Curl is not installed or not in PATH.\n\t\tOn macOS: brew install curl\n\t\tOn Linux: sudo apt install curl"
  exit 1
fi

# Check if docker compose version is >= 2
if [ "$(docker compose version --short | cut -d' ' -f3 | cut -d'.' -f1)" -lt 2 ]; then
  echo -e "\t❌ Docker Compose is outdated. Please update Docker Compose to version 2 or higher.\n\t\tSee https://docs.docker.com/compose/install/linux/"
  exit 1
fi
# Check if docker-compose is installed, if so issue a warning if version is < 2
if command -v docker-compose &>/dev/null; then
  if [ "$(docker-compose version --short | cut -d' ' -f3 | cut -d'.' -f1)" -lt 2 ]; then
    echo -e "\n\t⚠️ 'docker-compose' is installed but outdated. Make sure to use 'docker compose' or to upgrade 'docker-compose' to version 2.\n\t\tSee https://docs.docker.com/compose/install/standalone/\n"
  fi
fi

# Catch errors
set -e
function on_exit {
  # $? is the exit status of the last command executed
  local exit_status=$?
  if [ $exit_status -ne 0 ]; then
    echo "❌ Something went wrong, exiting: $exit_status"
  fi
}
trap on_exit EXIT

# Use environment variables VERSION and BRANCH, with defaults if not set
version=${VERSION:-$(curl -s "https://hub.docker.com/v2/repositories/twentycrm/twenty/tags" | grep -o '"name":"[^"]*"' | grep -v 'latest' | cut -d'"' -f4 | sort -V | tail -n1)}
branch=${BRANCH:-$(curl -s https://api.github.com/repos/twentyhq/twenty/tags | grep '"name":' | head -n 1 | cut -d '"' -f 4)}

echo "🚀 Using docker version $version and Github branch $branch"

dir_name="twenty"
function ask_directory {
  read -p "📁 Enter the directory name to setup the project (default: $dir_name): " answer
  if [ -n "$answer" ]; then
    dir_name=$answer
  fi
}

ask_directory

while [ -d "$dir_name" ]; do
  read -p "🚫 Directory '$dir_name' already exists. Do you want to overwrite it? (y/N) " answer
  if [ "$answer" = "y" ]; then
    break
  else
    ask_directory
  fi
done

# Create a directory named twenty
echo "📁 Creating directory '$dir_name'"
mkdir -p "$dir_name" && cd "$dir_name" || { echo "❌ Failed to create/access directory '$dir_name'"; exit 1; }

# Copy twenty/packages/twenty-docker/docker-compose.yml in it
echo -e "\t• Copying docker-compose.yml"
curl -sLo docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/docker-compose.yml

# Copy twenty/packages/twenty-docker/.env.example to .env
echo -e "\t• Setting up .env file"
curl -sLo .env https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/.env.example

# Replace TAG=latest by TAG=<latest_release or version input>
if [[ $(uname) == "Darwin" ]]; then
  # Running on macOS
  sed -i '' "s/TAG=latest/TAG=$version/g" .env
else
  # Assuming Linux
  sed -i'' "s/TAG=latest/TAG=$version/g" .env
fi

# Generate random strings for secrets
echo "# === Randomly generated secret ===" >>.env
echo "APP_SECRET=$(openssl rand -base64 32)" >>.env

# Issue with Postgres spilo?
#echo "" >>.env
#echo "PGPASSWORD_SUPERUSER=$(openssl rand -hex 16)" >>.env

echo -e "\t• .env configuration completed"

port=3000
# Check if command nc is available
if command -v nc &> /dev/null; then
  # Check if port 3000 is already in use, propose to change it
  while nc -zv localhost $port &>/dev/null; do
    read -p "🚫 Port $port is already in use. Do you want to use another port? (Y/n) " answer
    if [ "$answer" = "n" ]; then
      continue
    fi
    read -p "Enter a new port number: " new_port
    if [[ $(uname) == "Darwin" ]]; then
      sed -i '' "s/$port:$port/$new_port:$port/g" docker-compose.yml
      sed -E -i '' "s|^SERVER_URL=http://localhost:[0-9]+|SERVER_URL=http://localhost:$new_port|g" .env
    else
      sed -i'' "s/$port:$port/$new_port:$port/g" docker-compose.yml
      sed -E -i'' "s|^SERVER_URL=http://localhost:[0-9]+|SERVER_URL=http://localhost:$new_port|g" .env
    fi
    port=$new_port
  done
fi

# Ask user if they want to start the project
read -p "🚀 Do you want to start the project now? (Y/n) " answer
if [ "$answer" = "n" ]; then
  echo "✅ Project setup completed. Run 'docker compose up -d' to start."
  exit 0
else
  echo "🐳 Starting Docker containers..."
  docker compose up -d
  # Check if port is listening
  echo "Waiting for server to be healthy, it might take a few minutes while we initialize the database..."
  # Tail logs of the server until it's ready
  docker compose logs -f server &
  pid=$!
  while [ ! $(docker inspect --format='{{.State.Health.Status}}' twenty-server-1) = "healthy" ]; do
    sleep 1
  done
  kill $pid
  echo ""
  echo "✅ Server is up and running"
fi

function ask_open_browser {
  read -p "🌐 Do you want to open the project in your browser? (Y/n) " answer
  if [ "$answer" = "n" ]; then
    echo "✅ Setup completed. Access your project at http://localhost:$port"
    exit 0
  fi
}

# Ask user if they want to open the project
# Running on macOS
if [[ $(uname) == "Darwin" ]]; then
  ask_open_browser

  open "http://localhost:$port"
# Assuming Linux
else
  # xdg-open is not installed, we could be running in a non gui environment
  if command -v xdg-open >/dev/null 2>&1; then
    ask_open_browser

    xdg-open "http://localhost:$port"
  else
    echo "✅ Setup completed. Your project is available at http://localhost:$port"
  fi
fi
