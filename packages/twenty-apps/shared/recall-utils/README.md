# Shared Recall utilities

Pure provider parsing and retry rules used by Desktop Recorder and Call Recorder.
Both applications resolve this source through their TypeScript path alias and
bundle it into their logic functions. Installed apps need no shared package or
local filesystem path.

Keep application identity, configuration, authentication, storage, and lifecycle
logic in the individual applications. The existing provider tests in each app
cover these utilities.
