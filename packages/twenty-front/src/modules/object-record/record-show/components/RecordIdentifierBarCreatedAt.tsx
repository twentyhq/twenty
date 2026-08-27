import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { StyledHeaderIdentifierLabel } from '@/ui/layout/page/components/StyledHeaderIdentifierLabel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { AppTooltip } from 'twenty-ui/surfaces';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

const StyledCreatedAt = styled(StyledHeaderIdentifierLabel)`
  cursor: pointer;
`;

type RecordIdentifierBarCreatedAtProps = {
  objectRecordId: string;
};

export const RecordIdentifierBarCreatedAt = ({
  objectRecordId,
}: RecordIdentifierBarCreatedAtProps) => {
  const recordCreatedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    { recordId: objectRecordId, fieldName: 'createdAt' },
  );
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const instanceId = useId().replace(/:/g, '');

  if (!isNonEmptyString(recordCreatedAt)) {
    return null;
  }

  const createdAtElementId = `record-identifier-bar-created-at-${instanceId}`;
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(
    recordCreatedAt,
    localeCatalog,
  );

  return (
    <>
      <StyledCreatedAt id={createdAtElementId}>
        <Trans>Created {beautifiedCreatedAt}</Trans>
      </StyledCreatedAt>
      <AppTooltip
        anchorSelect={`#${createdAtElementId}`}
        content={beautifyExactDateTime(recordCreatedAt)}
        clickable
        noArrow
        place="left"
      />
    </>
  );
};
