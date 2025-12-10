import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import { AvatarChip, LinkChip } from 'twenty-ui/components';

const StyledRecordLink = styled.span`
  align-items: center;
  cursor: pointer;
  display: inline-flex;
`;

type RecordLinkProps = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

export const RecordLink = ({
  objectNameSingular,
  recordId,
  displayName,
}: RecordLinkProps) => {
  const navigate = useNavigate();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const handleClick = () => {
    if (isNonEmptyString(recordId)) {
      navigate(`/objects/${objectNameSingular}/${recordId}`);
    }
  };

  if (!objectMetadataItem) {
    return <span>{displayName}</span>;
  }

  return (
    <StyledRecordLink>
      <LinkChip
        label={displayName}
        to={`/objects/${objectNameSingular}/${recordId}`}
        onClick={handleClick}
        leftComponent={
          <AvatarChip
            placeholder={displayName}
            placeholderColorSeed={recordId}
            avatarType="rounded"
            avatarUrl=""
          />
        }
      />
    </StyledRecordLink>
  );
};

// Regex to match [[record:objectName:recordId:displayName]] pattern
export const RECORD_REFERENCE_REGEX =
  /\[\[record:([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/g;

export const parseRecordReference = (match: string) => {
  const regex = /\[\[record:([a-zA-Z]+):([a-f0-9-]+):([^\]]+)\]\]/;
  const result = regex.exec(match);

  if (!result) {
    return null;
  }

  return {
    objectNameSingular: result[1],
    recordId: result[2],
    displayName: result[3],
  };
};
