// Meeting platforms a Recall bot can join. Anything else (Around, Whereby,
// ro.am, Daily, plain dial-in, etc.) cannot be recorded and is ignored.
// See https://docs.recall.ai/docs/meeting-platforms
// Ordered by provider precedence: the first matching provider wins (e.g. a
// pasted Zoom invitation beats an auto-added Meet link).
export const SUPPORTED_MEETING_PLATFORM_URL_PATTERNS: RegExp[] = [
  /https:\/\/(?:[\w-]+\.)*(?:zoom\.us|zoomgov\.com)\/(?:j|my|s|w|wc\/join)\/[^\s"'<>\\]+/i,
  /https:\/\/meet\.google\.com\/[^\s"'<>\\]+/i,
  /https:\/\/teams\.(?:microsoft|live)\.com\/(?:l\/meetup-join|meet)\/[^\s"'<>\\]+/i,
  /https:\/\/(?:[\w-]+\.)*webex\.com\/(?:meet\/|join\/|[\w-]+\/j\.php\?)[^\s"'<>\\]+/i,
  /https:\/\/(?:[\w-]+\.)*(?:gotomeeting\.com\/join|gotomeet\.me)\/[^\s"'<>\\]+/i,
];
