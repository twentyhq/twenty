export enum EnvironmentVariablesGroup {
  // Server & Config
  ServerConfig = 'server-config',
  RateLimiting = 'rate-limiting',
  StorageConfig = 'storage-config',

  // Authentication
  GoogleAuth = 'google-auth',
  MicrosoftAuth = 'microsoft-auth',
  AuthenticationTokensDuration = 'authentication-tokens-duration',

  // Email
  EmailSettings = 'email-settings',

  // Logging
  Logging = 'logging',
  ExceptionHandler = 'exception-handler',

  // Other
  Other = 'other',
  BillingConfig = 'billing-config',
  CaptchaConfig = 'captcha-config',
  CloudflareConfig = 'cloudflare-config',
  LLM = 'llm',
  ServerlessConfig = 'serverless-config',
  SSL = 'ssl',
  SupportChatConfig = 'support-chat-config',
  TinybirdConfig = 'tinybird-config',
  TokensDuration = 'tokens-duration',
}
