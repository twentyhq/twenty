import { styled } from '@linaria/react';
import { DetailsRow } from 'twenty-ui/components/data-display';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconCurrencyDollar,
  IconLink,
  IconMap,
  IconTarget,
  IconUserCircle,
} from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatApprovalMergeFixture } from '@/ai/components/__stories__/AiChatApprovalMergeFixture';
import { BooleanDisplay } from '@/ui/field/display/components/BooleanDisplay';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

const MERGE_FIELD_ICON_SIZE = 14;
const MERGE_FIELD_LABEL_WIDTH = 112;

const StyledFields = styled.dl`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin: 0;
  min-width: 0;
`;

const StyledValue = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
`;

const StyledOwner = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type AiChatApprovalMergeReviewFieldsProps = {
  fields: AiChatApprovalMergeFixture['sources'][number]['fields'];
};

export const AiChatApprovalMergeReviewFields = ({
  fields,
}: AiChatApprovalMergeReviewFieldsProps) => (
  <StyledFields>
    <DetailsRow
      label="URL"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconLink size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <LinkDisplay value={{ url: fields.url }} />
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="Account Owner"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconUserCircle size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <StyledOwner>
          <Avatar name={fields.owner} size="sm" shape="circle" />
          <TextDisplay text={fields.owner} />
        </StyledOwner>
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="Address"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconMap size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <TextDisplay text={fields.address} />
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="ICP"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconTarget size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <BooleanDisplay value={fields.isIdealCustomer} />
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="Revenue"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconCurrencyDollar size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <TextDisplay text={fields.revenue} />
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="Linkedin"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconBrandLinkedin size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <LinkDisplay
          value={{ url: fields.linkedin, label: 'linkedin.com/company...' }}
        />
      </StyledValue>
    </DetailsRow>
    <DetailsRow
      label="Twitter"
      labelWidth={MERGE_FIELD_LABEL_WIDTH}
      startIcon={<IconBrandX size={MERGE_FIELD_ICON_SIZE} />}
    >
      <StyledValue>
        <Chip variant="outline" shape="round">
          {fields.twitter}
        </Chip>
      </StyledValue>
    </DetailsRow>
  </StyledFields>
);
