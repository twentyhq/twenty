// Ambient fallback so `*.module.scss` imports typecheck under a standalone tsgo run.
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
