export const IS_PREVIEW =
  import.meta.env.DEV &&
  !window.companion &&
  new URLSearchParams(window.location.search).has('preview');
