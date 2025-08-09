#!/bin/sh

# Flag file to track if oauth cron setup has been completed
OAUTH_CRON_SETUP_FLAG_FILE="/app/.oauth-cron-setup-completed"

automated_oauth_integration_cron_setup() {
    # Check if cron setup is enabled and not already completed
    if [ "${AUTO_OAUTH_CRON_SETUP_ENABLED}" != "true" ]; then
        echo "Automated cron setup is disabled (AUTO_OAUTH_CRON_SETUP_ENABLED=${AUTO_OAUTH_CRON_SETUP_ENABLED})"
        return
    fi

    if [ -f "${OAUTH_CRON_SETUP_FLAG_FILE}" ]; then
        echo "OAuth cron setup already completed, skipping automated cron registration..."
        return
    fi

    echo "============================================================"
    echo "STARTING AUTOMATED OAUTH INTEGRATION CRON SETUP"
    echo "============================================================"

    # Determine if messaging or calendar jobs need to be registered
    register_messaging=false
    register_calendar=false

    if [ "${MESSAGING_PROVIDER_GMAIL_ENABLED}" = "true" ] || [ "${MESSAGING_PROVIDER_MICROSOFT_ENABLED}" = "true" ]; then
        register_messaging=true
    fi

    if [ "${CALENDAR_PROVIDER_GOOGLE_ENABLED}" = "true" ] || [ "${CALENDAR_PROVIDER_MICROSOFT_ENABLED}" = "true" ]; then
        register_calendar=true
    fi

    if [ "$register_messaging" = "true" ] || [ "$register_calendar" = "true" ]; then
        echo "Registering messaging and/or calendar cron jobs..."

        # Messaging jobs (if any messaging integration is enabled)
        if [ "$register_messaging" = "true" ]; then
            if yarn command:prod cron:messaging:messages-import \
                && yarn command:prod cron:messaging:message-list-fetch \
                && yarn command:prod cron:messaging:ongoing-stale; then
                echo "✅ Messaging cron jobs registered successfully!"
            else
                echo "❌ Failed to register messaging cron jobs"
                return 1
            fi
        fi

        # Calendar jobs (if any calendar integration is enabled)
        if [ "$register_calendar" = "true" ]; then
            if yarn command:prod cron:calendar:calendar-event-list-fetch \
                && yarn command:prod cron:calendar:calendar-events-import \
                && yarn command:prod cron:calendar:ongoing-stale; then
                echo "✅ Calendar cron jobs registered successfully!"
            else
                echo "❌ Failed to register calendar cron jobs"
                return 1
            fi
        fi

        # Common workflow job (register if any integration is enabled)
        if yarn command:prod cron:workflow:automated-cron-trigger; then
            echo "✅ Workflow cron job registered successfully!"
        else
            echo "❌ Failed to register workflow cron job"
            return 1
        fi

        # Mark cron setup as completed
        touch "${OAUTH_CRON_SETUP_FLAG_FILE}"
        echo "✅ OAuth cron setup completed and marked as done"

        echo "============================================================"
        echo "OAuth integration cron job(s) now registered and will run when worker starts"
        echo "============================================================"
    else
        echo "Messaging/Calendar integrations disabled, skipping related cron jobs"
    fi

    echo "============================================================"
    echo "AUTOMATED OAUTH INTEGRATION CRON SETUP COMPLETED SUCCESSFULLY"
    echo "============================================================"
}