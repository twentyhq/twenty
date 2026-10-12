# App development session

The parent owns observation and two bounded scheduling lanes: one build worker
and one remote apply. `runDevLoop` keeps only the latest pending snapshot. Every
snapshot is released once, including superseded builds and cancellation; the
active apply retains its files until its reads settle. The skip key is the last
acknowledged remote content hash, cleared after a failed apply.

`buildDevSnapshot` copies declared, size/SHA-256-verified artifacts into a fresh
`dev-*` directory while the compiler's snapshot lease is held. The worker then
releases its own snapshot and exits, so retained builds do not retain compiler
heaps. At most three snapshot directories exist for an active session: in-flight
apply, compiler source, and its copy. No hard links or mutable output tree.

Input collection is private worker metadata, absent on ordinary build requests.
It observes esbuild loads/resolution parents, static-file copies and TypeScript
reads. Missing TypeScript package-scope probes cannot expand watching into
unrelated ancestor directories. Inputs have stamps captured before reads; after
attaching the watcher, changed stamps invalidate the result. A successful graph
replaces the previous graph; a failure watches the last successful graph plus
only that attempt's inputs. External directory observation is shallow.

`applyAppBuild` handles remote operations. Dev supplies a
revision-specific approval signal and a check immediately before the first
write. Once writes start, a newer build does not cancel those writes. Client
generation pauses compilation and invalidates pending builds; its successful
input key plus output stamps prevent generation loops. A failure after client
writes start ends the session. Normal compilation failures keep watching;
abnormal worker exits and watcher failures require restart.

There is no incremental compiler cache or package-manager dependency watcher.
Arbitrary app-code filesystem reads, concurrent independent dev processes,
and SIGKILL recovery are outside this
session's guarantees. See the [command reference](../../../docs/commands.md#develop-an-app) for
user-visible limits.
