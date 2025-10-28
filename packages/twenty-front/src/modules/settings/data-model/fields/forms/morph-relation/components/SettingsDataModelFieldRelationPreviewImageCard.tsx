import styled from '@emotion/styled';

const StyledRelationImage = styled.img<{
  flip?: boolean;
  isMobile: boolean;
}>`
  transform: ${({ flip, isMobile }) => {
    let transform = '';
    if (isMobile) {
      transform += 'rotate(90deg) ';
    }
    if (flip === true) {
      transform += 'scaleX(-1)';
    }
    return transform.trim();
  }};
  margin: auto;
  width: 54px;
`;

export const SettingsDataModelRelationPreviewImage = ({
  isMobile,
  flip,
  src,
  alt,
}: {
  isMobile: boolean;
  flip?: boolean;
  src: string;
  alt: string;
}) => {
  return (
    <StyledRelationImage isMobile={isMobile} flip={flip} src={src} alt={alt} />
  );
};
