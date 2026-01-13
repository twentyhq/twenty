# Fast session-start hook - provides context without slow operations
$ErrorActionPreference = "SilentlyContinue"

$projectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { "." }
$context = "Session started."

# Fast git info
try {
    $isGitRepo = git -C $projectDir rev-parse --git-dir 2>$null
    if ($isGitRepo) {
        $branch = git -C $projectDir branch --show-current 2>$null
        if ($branch) {
            $context += " Branch: $branch."
        }

        # Quick dirty check
        $diff = git -C $projectDir diff --quiet 2>$null
        if ($LASTEXITCODE -ne 0) {
            $context += " Uncommitted changes present."
        }
    }
} catch { }

# Check for recent plans
$plansDir = Join-Path $projectDir "docs\plans"
if (Test-Path $plansDir) {
    $plans = Get-ChildItem -Path $plansDir -Filter "*.md" -ErrorAction SilentlyContinue
    if ($plans) {
        $context += " Plans available in docs/plans/."
    }
}

$context += " Consult SKILL-LIST.md before tasks."

# Output JSON for Claude Code
$output = @{
    hookSpecificOutput = @{
        hookEventName = "SessionStart"
        additionalContext = $context
    }
} | ConvertTo-Json -Compress

Write-Output $output
