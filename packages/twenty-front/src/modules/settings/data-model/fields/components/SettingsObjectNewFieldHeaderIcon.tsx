import {
  ObjectMetadataIcon,
  type ObjectMetadataIconInput,
} from '@/object-metadata/components/ObjectMetadataIcon';
import { styled } from '@linaria/react';

const StyledObjectIconContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  opacity: 0.64;
`;

type SettingsObjectNewFieldHeaderIconProps = {
  objectMetadataItem: ObjectMetadataIconInput;
};

export const SettingsObjectNewFieldHeaderIcon = ({
  objectMetadataItem,
}: SettingsObjectNewFieldHeaderIconProps) => (
  <StyledObjectIconContainer>
    <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
  </StyledObjectIconContainer>
);
