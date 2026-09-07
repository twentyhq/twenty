import { downloadFile } from '@/activities/files/utils/downloadFile';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconDownload } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.lg};
  max-width: 400px;
`;

type UnavailableFilePreviewProps = {
  fileName: string;
  fileUrl: string;
  message: ReactNode;
};

export const UnavailableFilePreview = ({
  fileName,
  fileUrl,
  message,
}: UnavailableFilePreviewProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledTitle>
        <Trans>Preview Not Available</Trans>
      </StyledTitle>
      <StyledMessage>{message}</StyledMessage>
      <Button
        Icon={IconDownload}
        title={t`Download File`}
        onClick={() => downloadFile(fileUrl, fileName)}
        variant="secondary"
      />
    </StyledContainer>
  );
};
