const PACKAGE_NAME_PATTERN =
  /^(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/;

const PACKAGE_NAME_MAX_LENGTH = 214;

export const isValidPackageName = (name: string) =>
  name.length <= PACKAGE_NAME_MAX_LENGTH &&
  !['node_modules', 'favicon.ico'].includes(name) &&
  PACKAGE_NAME_PATTERN.test(name);
