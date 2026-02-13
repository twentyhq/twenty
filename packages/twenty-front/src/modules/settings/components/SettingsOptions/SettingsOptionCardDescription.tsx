import { StyledSettingsCardDescription } from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { isValidElement, type ReactNode } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const getTextContentFromNode = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextContentFromNode).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContentFromNode(node.props.children);
  }

  return '';
};

type SettingsOptionCardDescriptionProps = {
  description?: ReactNode;
};

export const SettingsOptionCardDescription = ({
  description,
}: SettingsOptionCardDescriptionProps) => {
  if (
    description === null ||
    description === undefined ||
    typeof description === 'boolean'
  ) {
    return null;
  }

  if (typeof description === 'string' || typeof description === 'number') {
    return (
      <StyledSettingsCardDescription>
        <OverflowingTextWithTooltip text={String(description)} />
      </StyledSettingsCardDescription>
    );
  }

  const tooltipContent = getTextContentFromNode(description).trim();

  if (!tooltipContent.length) {
    return (
      <StyledSettingsCardDescription>{description}</StyledSettingsCardDescription>
    );
  }

  return (
    <StyledSettingsCardDescription>
      <OverflowingTextWithTooltip
        text={description}
        tooltipContent={tooltipContent}
      />
    </StyledSettingsCardDescription>
  );
};
