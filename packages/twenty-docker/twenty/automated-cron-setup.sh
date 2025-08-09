#!/bin/sh

# Flag file to track if cron setup has been completed
CRON_SETUP_FLAG_FILE="/app/.cron-setup-completed"

automated_cron_setup() {    
    # Check if cron setup is enabled and not already completed
    if [ "${AUTO_CRON_SETUP_ENABLED}" != "true" ]; then
        echo "Automated cron setup is disabled (AUTO_CRON_SETUP_ENABLED=${AUTO_CRON_SETUP_ENABLED})"
        return
    fi

    if [ -f "${CRON_SETUP_FLAG_FILE}" ]; then
        echo "Cron setup already completed, skipping automated cron registration..."
        return
    fi

    echo "============================================================"
    echo "STARTING AUTOMATED CRON SETUP"
    echo "============================================================"

    # Register nestbox AI agent cron job
    echo "Registering nestbox AI agent cron job..."
    
    if yarn command:prod cron:nestbox-ai:agent; then
        echo "✅ Nestbox AI agent cron job registered successfully!"
        
        # Mark cron setup as completed
        touch "${CRON_SETUP_FLAG_FILE}"
        echo "✅ Cron setup completed and marked as done"
        
        echo "============================================================"
        echo "AUTOMATED CRON SETUP COMPLETED SUCCESSFULLY"
        echo "============================================================"
        echo "Nestbox AI agent cron job is now registered and will run when worker starts"
        echo "============================================================"
        
    else
        echo "❌ Failed to register nestbox AI agent cron job"
        return 1
    fi
} 