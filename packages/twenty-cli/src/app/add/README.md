# App definition scaffolding

The templates create object, field, logic-function and front-component
definitions. Names and filenames use the CLI's kebab-case helper; display labels
use the same helper as app init.

## Contract

- `twenty app add [entity]` accepts `object`, `field`, `logic-function` and
  `front-component`. A human terminal can supply omitted values interactively.
  JSON, CI, redirected stdin and `--no-input` never prompt; missing required or
  inapplicable options exit 2. Labels default to the name; fields default to
  `TEXT`.
- `--path` selects an app, like the other CLI app commands. Files go under the
  selected app's `src/objects`, `src/fields`, `src/logic-functions` or
  `src/front-components`. Custom output directories are not supported.
- Parent and relation endpoint identifiers must be valid universal UUIDs. No
  workspace lookup verifies ownership or existence. Relations require reviewing
  both endpoints; this generator creates only the requested standalone field.
- Node's `randomUUID` creates version 4 identifiers. The CLI TypeScript printer
  escapes authored strings, including quotes, backslashes and line breaks.
- App discovery, SDK compatibility and application identity reuse the CLI's
  worker boundary. Identity loading evaluates trusted app code in a disposable
  worker; it is not a security sandbox. The command makes no workspace requests
  and does not require authentication.
- Destination paths reuse pull's containment and symlink checks. A fully staged
  file is linked exclusively into place, so an existing or concurrently created
  destination is never replaced. Cancellation before that link removes the
  staged file; a successful link wins over late cancellation. Cleanup failure
  after success warns and reports the remaining temporary directory. Empty
  parent directories can remain after failure or cancellation. Exclusive atomic
  creation requires a filesystem supporting hard links; unsupported filesystems
  fail instead of falling back to a potentially partial destination write.
- JSON reports app-relative `createdPaths`. There is no overwrite mode and no
  editing or registration of existing definitions. Object view, layout and menu
  companions and other entity generators are not supported.

These are starter definitions, not a deployment validator. Review type-specific
settings, relation endpoints, handlers and components, then build and plan the
app. Successful generation does not imply the server will accept the metadata.

## Verification

`add-template-parity.spec.ts` compares generated source with the repository SDK,
normalizing random UUIDs while preserving their reuse. It covers every field type
and both runtime templates. Additional tests cover escaped strings, invalid
identifiers, destination conflicts and cancellation.
