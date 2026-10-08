# App definition scaffolding

The templates create object, field, logic-function and front-component
definitions. Filenames and logic-function/front-component names use kebab-case.
Object and field metadata names keep the entered spelling; display labels use
the same helper as app init.

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
- Objects accept `--create-view`, `--create-navigation-menu-item` and
  `--create-page-layout`. Each flag opts into that definition; page layouts also
  create the fields view used by their Fields widget. The list view and fields
  view reuse the object's name field. Fields views also include the SDK's
  generated audit fields, resolved using the application's universal identifier.
- Node's `randomUUID` creates version 4 identifiers. The CLI TypeScript printer
  escapes authored strings, including quotes, backslashes and line breaks.
- App discovery, SDK compatibility and application identity reuse the CLI's
  worker boundary. Identity loading evaluates trusted app code in a disposable
  worker; it is not a security sandbox. The command makes no workspace requests
  and does not require authentication.
- Destination paths reuse pull's containment and symlink checks. All destinations
  are checked before writing and all files are staged beside their destinations
  before exclusive linking, including when source directories are mounted on
  different filesystems.
  Existing or concurrently created files are never replaced. Failure or
  cancellation before all links complete rolls back the links already created;
  files replaced by another process are preserved. Incomplete rollback reports
  remaining app-relative paths. Completion wins over late cancellation. Cleanup failure
  after success warns and reports the remaining temporary directory. Empty
  parent directories can remain after failure or cancellation. Exclusive atomic
  creation requires a filesystem supporting hard links; unsupported filesystems
  fail instead of falling back to a potentially partial destination write.
- Path validation rejects existing symbolic links. It cannot prevent another
  local process from replacing a parent directory between validation and writing.
- JSON reports app-relative `createdPaths`. There is no overwrite mode and no
  editing or registration of existing definitions. Standalone view, layout and
  navigation item generators are not supported.

These are starter definitions, not a deployment validator. Review type-specific
settings, relation endpoints, handlers and components, then build and plan the
app. Successful generation does not imply the server will accept the metadata.

## Verification

`add-template-parity.spec.ts` compares generated source with the repository SDK,
normalizing random UUIDs while preserving their reuse. It covers every field type
and both runtime templates. Additional tests cover escaped strings, invalid
identifiers, destination conflicts and cancellation.

View and navigation templates are deliberately limited to object companions:
fully populated fields and an object-target navigation item, without the SDK
CLI's placeholder and unrelated view/link/folder variants. Generated identifiers
and references are checked by the app-add command tests; record page layouts
also retain SDK source parity.
