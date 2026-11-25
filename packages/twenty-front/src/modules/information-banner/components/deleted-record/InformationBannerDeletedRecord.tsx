import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { styled } from '@linaria/react';
import { IconRefresh } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
  const { restoreManyRecords } = useRestoreManyRecords({
    objectNameSingular,
  });

  return (
    <StyledInformationBannerDeletedRecord>
      <InformationBanner
        componentInstanceId="information-banner-deleted-record"
        status="error"
        message={t`This record has been deleted`}
        buttonTitle={t`Restore`}
        buttonIcon={IconRefresh}
        buttonOnClick={() => restoreManyRecords({ idsToRestore: [recordId] })}
      />
    </StyledInformationBannerDeletedRecord>
  );
};
