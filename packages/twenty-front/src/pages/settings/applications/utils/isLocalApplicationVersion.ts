import { isDefined } from 'twenty-shared/utils';

// A locally-applied app (`yarn twenty apply`) stores its version tagged with
// "(local)" to show it is detached from its published registration. See the
// server-side buildApplicationVersionForSourceType util that produces it.
export const LOCAL_APPLICATION_VERSION_MARKER = '(local)';

export const isLocalApplicationVersion = (
  version: string | null | undefined,
): boolean =>
  isDefined(version) && version.includes(LOCAL_APPLICATION_VERSION_MARKER);
