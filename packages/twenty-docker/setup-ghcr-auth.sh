#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if already logged in
check_existing_auth() {
    if docker system info 2>/dev/null | grep -q "ghcr.io"; then
        print_info "Already logged in to ghcr.io"

        # Try to pull image to verify auth works
        if docker pull ghcr.io/connorbelez/flcrmlms:latest &>/dev/null; then
            print_success "Authentication is valid!"
            echo ""
            read -p "Do you want to re-authenticate? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Keeping existing authentication"
                exit 0
            fi
        else
            print_warning "Authentication exists but seems invalid. Re-authenticating..."
        fi
    fi
}

# Main authentication function
authenticate() {
    print_header "GitHub Container Registry Authentication"

    echo "This script will help you authenticate with GitHub Container Registry (GHCR)"
    echo "to pull the private FLCRMLMS Docker images."
    echo ""

    # Get GitHub username
    print_info "Enter your GitHub username:"
    read -r GITHUB_USERNAME

    if [[ -z "$GITHUB_USERNAME" ]]; then
        print_error "Username cannot be empty"
        exit 1
    fi

    # Check if token is provided via environment
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
        print_info "Using GITHUB_TOKEN from environment"
        TOKEN="$GITHUB_TOKEN"
    else
        echo ""
        print_info "You need a GitHub Personal Access Token (PAT) with 'read:packages' scope"
        print_warning "Don't have a token? Create one at: https://github.com/settings/tokens/new"
        echo "  Required scopes: ✓ read:packages"
        echo ""
        print_info "Enter your GitHub Personal Access Token:"
        read -rs GITHUB_TOKEN
        TOKEN="$GITHUB_TOKEN"
        echo ""

        if [[ -z "$TOKEN" ]]; then
            print_error "Token cannot be empty"
            exit 1
        fi
    fi

    # Attempt login
    print_info "Authenticating with ghcr.io..."
    if echo "$TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin &>/dev/null; then
        print_success "Successfully authenticated with ghcr.io!"
    else
        print_error "Authentication failed. Please check your username and token."
        exit 1
    fi

    # Verify by pulling image
    echo ""
    print_info "Verifying authentication by pulling image..."
    if docker pull ghcr.io/connorbelez/flcrmlms:latest &>/dev/null; then
        print_success "Successfully pulled image! Authentication is working."
    else
        print_warning "Authentication succeeded but couldn't pull image."
        print_info "This might be a permissions issue. Verify you have access to the repository."
    fi
}

# Save credentials helper
save_credentials() {
    echo ""
    print_info "Your Docker credentials are stored in ~/.docker/config.json"
    print_warning "Keep this file secure and don't commit it to git!"

    if [[ -f ~/.docker/config.json ]]; then
        # Check if .docker/config.json is in gitignore
        if ! grep -q ".docker/config.json" ~/.gitignore_global 2>/dev/null; then
            echo ""
            read -p "Add ~/.docker/config.json to global gitignore? (Y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                mkdir -p ~/.gitignore_global
                echo ".docker/config.json" >> ~/.gitignore_global
                git config --global core.excludesfile ~/.gitignore_global
                print_success "Added to global gitignore"
            fi
        fi
    fi
}

# Print next steps
print_next_steps() {
    print_header "Next Steps"

    echo "You're all set! Here's what you can do now:"
    echo ""
    echo "1. ${GREEN}Pull the latest image:${NC}"
    echo "   docker-compose pull"
    echo ""
    echo "2. ${GREEN}Start the services:${NC}"
    echo "   docker-compose up -d"
    echo ""
    echo "3. ${GREEN}Check the logs:${NC}"
    echo "   docker-compose logs -f server"
    echo ""
    echo "4. ${GREEN}Access the application:${NC}"
    echo "   http://localhost:3000"
    echo ""
    print_info "For more information, see README-CUSTOM.md"
    echo ""
}

# Logout function
logout() {
    print_header "Logout from GHCR"

    docker logout ghcr.io
    print_success "Logged out from ghcr.io"
}

# Main execution
main() {
    check_docker

    # Check for flags
    case "${1:-}" in
        --logout)
            logout
            exit 0
            ;;
        --verify)
            print_header "Verifying GHCR Authentication"
            if docker pull ghcr.io/connorbelez/flcrmlms:latest &>/dev/null; then
                print_success "Authentication is valid!"
            else
                print_error "Not authenticated or authentication invalid"
                exit 1
            fi
            exit 0
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (no args)    Authenticate with GHCR"
            echo "  --verify     Verify existing authentication"
            echo "  --logout     Logout from GHCR"
            echo "  --help       Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_TOKEN    Use this token instead of prompting"
            exit 0
            ;;
    esac

    check_existing_auth
    authenticate
    save_credentials
    print_next_steps
}

# Run main function
main "$@"
