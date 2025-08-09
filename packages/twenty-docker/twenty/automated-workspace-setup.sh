#!/bin/sh

# Flag file to track if initial setup has been completed
SETUP_FLAG_FILE="/app/.initial-setup-completed"

automated_workspace_setup() {    
    # Check if automated setup is enabled and not already completed
    if [ "${AUTO_SETUP_ENABLED}" != "true" ]; then
        echo "Automated workspace setup is disabled (AUTO_SETUP_ENABLED=${AUTO_SETUP_ENABLED})"
        return
    fi

    if [ -f "${SETUP_FLAG_FILE}" ]; then
        echo "Initial setup already completed, skipping automated workspace creation..."
        return
    fi

    echo "============================================================"
    echo "STARTING AUTOMATED WORKSPACE SETUP"
    echo "============================================================"

    # Validate required environment variables
    if [ -z "${ADMIN_USER_EMAIL}" ] || [ -z "${ADMIN_USER_PASSWORD}" ] || [ -z "${WORKSPACE_NAME}" ]; then
        echo "ERROR: Missing required environment variables for automated setup:"
        echo "  ADMIN_USER_EMAIL: ${ADMIN_USER_EMAIL:-'NOT SET'}"
        echo "  ADMIN_USER_PASSWORD: ${ADMIN_USER_PASSWORD:+'SET'}"
        echo "  WORKSPACE_NAME: ${WORKSPACE_NAME:-'NOT SET'}"
        echo "Skipping automated setup..."
        return 1
    fi

    # Step 1: Create workspace and admin user
    echo "Creating workspace: ${WORKSPACE_NAME}"
    echo "Admin user: ${ADMIN_USER_EMAIL}"
    
    if yarn command:prod workspace:signup \
        --username="${ADMIN_USER_EMAIL}" \
        --password="${ADMIN_USER_PASSWORD}" \
        --workspace-name="${WORKSPACE_NAME}" \
        --timezone="${WORKSPACE_TIMEZONE:-America/New_York}" \
        --admin-first-name="${ADMIN_USER_FIRST_NAME:-Admin}" \
        --admin-last-name="${ADMIN_USER_LAST_NAME:-User}"; then
        
        echo "✅ Workspace created successfully!"
        
        # Step 2: Generate API key
        echo "Generating API key: ${API_KEY_NAME:-Initial API Key}"
        
        if yarn command:prod apikeys:create-token \
            --workspace="${WORKSPACE_NAME}" \
            --name="${API_KEY_NAME:-Initial API Key}" \
            --domain="${DOMAIN_NAME:-}" \
            --ip="${PUBLIC_IP:-}" \
            --gmail-enabled="${MESSAGING_PROVIDER_GMAIL_ENABLED:-}" \
            --google-calendar-enabled="${CALENDAR_PROVIDER_GOOGLE_ENABLED:-}"; then
            
            echo "✅ API key generated successfully!"
            
            # Mark setup as completed
            touch "${SETUP_FLAG_FILE}"
            echo "✅ Initial setup completed and marked as done"
            
            echo "============================================================"
            echo "AUTOMATED SETUP COMPLETED SUCCESSFULLY"
            echo "============================================================"
            echo "Your Twenty instance is ready to use!"
            echo "Access it at: ${SERVER_URL:-http://localhost:3000}"
            echo "Login with: ${ADMIN_USER_EMAIL}"
            echo "============================================================"
            
        else
            echo "❌ Failed to generate API key"
            return 1
        fi
        
    else
        echo "❌ Failed to create workspace"
        return 1
    fi
} 