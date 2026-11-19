import { ConditionalAvailabilityPermissionsLink } from '@/conditional-availability/components/ConditionalAvailabilityPermissionsLink';
import { Trans } from '@lingui/react/macro';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';

type ConditionalAvailabilityHelperTextProps = {
  metadataName: ConditionalAvailabilityMetadataName;
};

export const ConditionalAvailabilityHelperText = ({
  metadataName,
}: ConditionalAvailabilityHelperTextProps) => {
  switch (metadataName) {
    case 'pageLayoutWidget':
      return (
        <Field.Description>
          <Trans>
            Visibility hides this item on the page. It does not restrict access
            to data;{' '}
            <ConditionalAvailabilityPermissionsLink>
              role permissions
            </ConditionalAvailabilityPermissionsLink>{' '}
            do that.
          </Trans>
        </Field.Description>
      );
    default:
      return assertUnreachable(metadataName);
  }
};
