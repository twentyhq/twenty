# Twenty e2e Testing

## Prerequisite

Installing the browsers:

```
yarn playwright install 
```

### Run end-to-end tests

```
yarn run test:e2e
```

### Start the interactive UI mode

```
yarn run test:e2e:ui
```

### Run test only on Desktop Chrome

```
yarn run test:e2e:chrome
```

### Run test in specific file
```
yarn run test:e2e <filename>
```

### Runs the tests in debug mode.
```
yarn run test:e2e:debug
```

## Q&A

#### Why there's `path.resolve()` everywhere?
That's thanks to differences in root directory when running tests using commands and using IDE. When running tests with commands, 
the root directory is `twenty/packages/twenty-e2e-testing`, for IDE it depends on how someone sets the configuration. This way, it
ensures that no matter which IDE or OS Shell is used, the result will be the same.
