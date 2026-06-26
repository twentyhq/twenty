// The deployment region that determines the contracting Processor entity and
// terms. It maps to where Customer Personal Data actually lives. EU is the
// default; US is a custom deployment. Exposed over GraphQL, so it is a real enum
// (the repo convention is string literals except for GraphQL enums).
export enum DpaRegion {
  EU = 'EU',
  US = 'US',
}
