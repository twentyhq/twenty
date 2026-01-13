# Fast session-end hook - minimal logging
$ErrorActionPreference = "SilentlyContinue"

$projectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { "." }
$logDir = Join-Path $projectDir ".claude\logs"

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

# Log session end
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = Join-Path $logDir "$(Get-Date -Format 'yyyy-MM-dd').log"
Add-Content -Path $logFile -Value "[$timestamp] Session ended" -ErrorAction SilentlyContinue

# Output JSON for Claude Code
Write-Output '{"continue": true}'
