# Asterisk VoIP & Telephony

Full PBX integration via Asterisk ARI/AMI with click-to-call, call queues, IVR menus, auto-dialer campaigns, SIP trunk management, call recording, transcription, and sentiment analysis.

## Entities
- `AsteriskServerEntity` — ariUrl, ariUser, ariPassword, amiHost, connectionStatus
- `SIPExtensionEntity` — userId, extension, callerIdName, presenceStatus, doNotDisturb, forwardTo
- `CallLogEntity` — uniqueId, direction, status, callerNumber, calledNumber, contactId, dealId, durationSeconds, recordingUrl, transcription, sentimentScore, dispositionCode, queueName
- `CallQueueEntity` — name, strategy (ringall), memberExtensions, maxWait, announceMessage
- `IVRMenuEntity` — name, greetingTTS, options (digit->queue/extension/ivr/ai_agent)
- `DialerCampaignEntity` — name, mode (preview/power/predictive), contactListIds, agentExtensions, linesPerAgent, predictiveRatio, schedule, connectRate
- `SIPTrunkEntity` — name, provider (twilio), host, maxChannels, dids

## Service Methods
- `clickToCall(workspaceId, userId, destination, options)` — originates call via ARI
- `handleCallEvent(workspaceId, event)` — processes answer/hangup/dtmf/recording events
- `lookupInboundCaller(workspaceId, callerNumber)` — CRM contact screen pop
- `startRecording(workspaceId, uniqueId)` — starts call recording
- `saveTranscription(callId, transcription, sentiment)` — saves transcription + sentiment
- `createQueue(workspaceId, data)` — creates call queue
- `getQueueStats(workspaceId, queueName)` — waiting, avg wait, answered, abandoned, SLA
- `createDialerCampaign(workspaceId, data)` — creates auto-dialer campaign
- `startDialerCampaign(campaignId)` — starts campaign
- `getCallAnalytics(workspaceId, startDate, endDate)` — total/inbound/outbound/missed, top callers

## REST Endpoints
- Asterisk controller for ARI/AMI webhook events

## Feature Flag
`IS_MODULE_ASTERISK_ENABLED`

## Dependencies
- None
