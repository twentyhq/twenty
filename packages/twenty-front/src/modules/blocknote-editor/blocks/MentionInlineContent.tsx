import { createReactInlineContentSpec } from '@blocknote/react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LegacyMentionRenderer } from '@/blocknote-editor/components/LegacyMentionRenderer';
import { MentionRecordChip } from '@/mention/components/MentionRecordChip';

const StyledInlineMentionRecordChipContainer = styled.div`
  display: inline;
  height: auto;
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const MentionInlineContent = createReactInlineContentSpec(
  {
    type: 'mention' as const,
    propSchema: {
      recordId: {
        default: '' as const,
      },
      objectMetadataId: {
        default: '' as const,
      },
      objectNameSingular: {
        default: '' as const,
      },
      label: {
        default: '' as const,
      },
      imageUrl: {
        default: '' as const,
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const {
        recordId,
        objectMetadataId,
        objectNameSingular,
        label,
        imageUrl,
      } = props.inlineContent.props;

      // New notes store objectNameSingular + label + imageUrl directly
      if (isNonEmptyString(objectNameSingular) && isNonEmptyString(label)) {
        return (
          <StyledInlineMentionRecordChipContainer>
            <MentionRecordChip
              recordId={recordId}
              objectNameSingular={objectNameSingular}
              label={label}
              imageUrl={imageUrl}
            />
          </StyledInlineMentionRecordChipContainer>
        );
      }

      // Legacy notes only have objectMetadataId + recordId: fetch data
      return (
        <LegacyMentionRenderer
          recordId={recordId}
          objectMetadataId={objectMetadataId}
        />
      );
    },
  },
);
