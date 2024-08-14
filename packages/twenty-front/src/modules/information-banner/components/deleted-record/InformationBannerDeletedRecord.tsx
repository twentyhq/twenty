import { InformationBanner } from '@/information-banner/components/InformationBanner';
import styled from '@emotion/styled';

const StyledInformationBannerDeletedRecord = styled.div`
  height: 40px;
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const InformationBannerDeletedRecord = ({
  recordId,
}: {
  recordId: string;
}) => {
  return (
    <StyledInformationBannerDeletedRecord>
      <InformationBanner
        variant="danger"
        message={`This record has been deleted`}
        // buttonTitle="Restore"
        // buttonIcon={IconRefresh}
        // buttonOnClick={() => restore(recordId)}
      />
    </StyledInformationBannerDeletedRecord>
  );
};
