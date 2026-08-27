# Fathom live sync

Each Twenty user connects Fathom through OAuth. Fathom remains the recording
permission boundary, so the two login email addresses do not need to match.

The connection hook registers a signed webhook at `TWENTY_FUNCTIONS_URL` and
stores its identifier and signing secret in workspace-scoped application KV.
The webhook subscribes to recordings owned by the connected user and recordings
available through their Fathom team.

Deliveries are verified before parsing. A deterministic Call Recording ID makes
replayed deliveries idempotent. Calendar events are linked only when normalized
meeting URL and scheduled time produce one unambiguous match.

Twenty currently invokes the disconnect hook after deleting the connection
token. The hook therefore marks the registration inactive so signed deliveries
in flight are acknowledged, but cannot delete the remote Fathom webhook. Fathom
publishes no token revocation endpoint either, so the webhook keeps delivering
until the user removes the app from their Fathom settings; every such delivery
is verified, then skipped. The uninstall hook still holds every connection
token, so it deletes the Fathom webhook of each connected account before the
app goes away.
