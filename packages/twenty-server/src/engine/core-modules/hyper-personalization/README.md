# Hyper-Personalization

Real-time personalization engine with contact profiling, rule-based content variants, behavioral event tracking, and multi-channel content delivery.

## Entities
- `PersonalizationProfileEntity` — contactId, segment, interests, preferences, engagementScore, totalInteractions, contentAffinities, channelPreferences, preferredLanguage, timezone
- `PersonalizationRuleEntity` — name, targetField, operator (equals/contains/greater_than/in), value, channel (email/web/in_app/sms/push), contentVariant, priority, impressions, conversions
- `PersonalizationEventEntity` — contactId, eventType (page_view/click/form_submit/purchase/email_open), eventName, properties, pageUrl, referrer, device, country

## Service Methods
- `HyperPersonalizationService` — builds contact profiles from events, matches personalization rules, delivers content variants per channel, tracks impressions/conversions

## Feature Flag
N/A (core engagement module)

## Dependencies
- None
