import { t } from '@lingui/core/macro';

// Accepts the raw GraphQL enum value so both the metadata and admin generated
// ApplicationState enums (nominally distinct types) can use it.
export const getApplicationTransitionalStateLabel = (
  state: string,
): string | undefined => {
  switch (state) {
    case 'INSTALLING':
      return t`Installing...`;
    case 'UPGRADING':
      return t`Upgrading...`;
    case 'UNINSTALLING':
      return t`Uninstalling...`;
    default:
      return undefined;
  }
};
