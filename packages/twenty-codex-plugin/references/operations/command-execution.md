# Command Execution

Use this reference before running Twenty CLI commands from Codex.

## Never Run `yarn twenty` In The Sandbox

All `yarn twenty *` commands must run outside the sandbox with host-context execution. The Codex sandbox uses incompatible Node and Yarn versions and has no internet access, which causes `yarn twenty` commands to fail or produce misleading errors.

In Codex, always request elevated or out-of-sandbox execution for:

```bash
npx create-twenty-app
yarn twenty dev --once
yarn twenty dev:typecheck
yarn twenty dev:add
yarn twenty dev:build
yarn twenty dev:function:logs
yarn twenty dev:function:exec
yarn twenty docker:*
yarn twenty remote:*
yarn twenty app:*
yarn lint
curl http://localhost:2020/healthz
```

This applies to every `yarn twenty` subcommand, including commands that only check local files like `yarn twenty dev:typecheck`. If a command starts with `yarn twenty`, it must run outside the sandbox.

## Sandboxed Commands

Only plain file-inspection commands that do not invoke `yarn`, `npm`, `npx`, or `node` can run sandboxed:

```bash
sed -n '1,220p' package.json
find src -maxdepth 3 -type f | sort
cat src/application-config.ts
```

If a command needs the project's toolchain, run it outside the sandbox.
