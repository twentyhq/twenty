---
name: deployment-mode
description: Enable DigitalOcean and deployment tools via Docker MCP Gateway. Use when working with droplets, VPCs, domains, firewalls, or any infrastructure.
---

# Deployment Mode

Enable infrastructure management tools through Docker MCP Gateway.

## Architecture

AI Layer uses Docker MCP Gateway for dynamic MCP server management:

```
Claude Code
    ↓
MCP_DOCKER (Docker MCP Gateway)
    ├── supabase       ← Always enabled (database stack)
    ├── github         ← Always enabled (development)
    ├── playwright     ← Always enabled (testing)
    ├── fetch          ← Always enabled (web access)
    └── docker/dockerhub ← Enable for deployment
```

## Stack Management

Use the stack management script to enable/disable server groups:

```powershell
# View current status
.\stacks\docker\scripts\mcp-stack.ps1 -Stack deployment -Action status

# Enable deployment servers
.\stacks\docker\scripts\mcp-stack.ps1 -Stack deployment -Action enable

# Disable when done
.\stacks\docker\scripts\mcp-stack.ps1 -Stack deployment -Action disable
```

## Available Stacks

| Stack | Servers | Purpose |
|-------|---------|---------|
| `minimal` | fetch, time, sequentialthinking | Essential tools only |
| `database` | supabase | Database operations |
| `workflow` | slack | Workflow automation |
| `deployment` | dockerhub, docker | Infrastructure management |
| `develop` | github, playwright, fetch, time | Development workflow |
| `all` | Everything | Full tool access |

## DigitalOcean MCP

DigitalOcean MCP is not in the Docker catalog. For infrastructure work:

1. **Option 1**: Use Docker tools (dockerhub, docker) for container management
2. **Option 2**: Add custom catalog:
   ```bash
   docker mcp catalog create ai-layer
   docker mcp catalog add ai-layer digitalocean stacks/docker/ai-layer-mcp-catalog.yaml
   ```

## Token Impact

| Configuration | Approx. Token Usage |
|--------------|---------------------|
| Minimal stack | ~5k tokens |
| Database + Develop | ~10k tokens |
| All servers | ~18k tokens |

## Quick Commands

```powershell
# Check enabled servers
docker mcp server ls

# Enable specific server
docker mcp server enable supabase

# Disable specific server
docker mcp server disable playwright

# Connect Claude Code to Gateway
docker mcp client connect claude-code

# View available catalog
docker mcp catalog show docker-mcp
```

## After Changes

Always restart Claude Code after enabling/disabling servers:

```bash
# Exit current session
exit

# Start new session
claude
```
