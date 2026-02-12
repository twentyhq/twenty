import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/display';

const StyledInformationBannerDeletedRecord = styled.div`
  height: 40px;
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const InformationBannerDeletedRecord = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular,
  });

  return (
    <StyledInformationBannerDeletedRecord>
      <InformationBanner
        componentInstanceId="information-banner-deleted-record"
        variant="danger"
        message={t`This record has been deleted`}
        buttonTitle={t`Restore`}
        buttonIcon={IconRefresh}
        buttonOnClick={() => restoreManyRecords({ idsToRestore: [recordId] })}
      />
    </StyledInformationBannerDeletedRecord>
  );
};
