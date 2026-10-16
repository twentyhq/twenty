# Function Execute Test App

Fixture app used to exercise logic-function execution in CLI tests.

Build the standalone CLI from the repository root before using this fixture's `dev`, `exec`, or `uninstall` scripts:

```bash
npx nx build twenty-cli
```

The scripts invoke that local build directly, so the SDK binary cannot shadow it.
