// Extensions where Twenty intentionally deviates from the IANA-standard mime
// mapping returned by mrmime. Twenty's storage layer persists these values
// instead of mrmime's output (or instead of throwing in the case of `.ts`).
//
// Why each entry exists:
//   - ts/tsx:    IANA registers `.ts` as `video/mp2t` (MPEG-2 Transport Stream),
//                which predates TypeScript. `.tsx` is unregistered. Twenty uses
//                the developer-tooling convention `application/typescript`.
//   - cjs:       mrmime returns `application/node`, which is the Node.js
//                runtime mime; we want browsers and clients to treat CommonJS
//                files as plain JavaScript per RFC 9239.
//
// Only add an entry when (1) mrmime returns the wrong mime (collision) or no
// mime AND (2) there is a clear developer-tooling convention for the right
// mime. For media, archives, documents, and anything else with a real IANA
// registration (including `.js` and `.mjs`, which mrmime already maps to
// `text/javascript`), trust mrmime.
export const TWENTY_MIME_POLICY: Record<string, string> = {
  ts: 'application/typescript',
  tsx: 'application/typescript',
  cjs: 'text/javascript',
};
