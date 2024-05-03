import { ReactElement, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'packages/twenty-ui';

import { Tag } from '@/ui/display/tag/components/Tag';
import {
  ExpandableList,
  ExpandableListProps,
} from '@/ui/layout/expandable-list/components/ExpandableList';
import { MAIN_COLOR_NAMES } from '@/ui/theme/constants/MainColorNames';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 300px;
`;

type RenderProps = ExpandableListProps & {
  children: ReactElement[];
};

const Render = (args: RenderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const reference = useRef<HTMLDivElement>(null);

  return (
    <StyledContainer
      ref={reference}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ExpandableList
        reference={reference.current || undefined}
        forceDisplayHiddenCount={args.forceDisplayHiddenCount}
        withDropDownBorder={args.withDropDownBorder}
        isHovered={isHovered}
      >
        {args.children}
      </ExpandableList>
    </StyledContainer>
  );
};

const meta: Meta<typeof ExpandableList> = {
  title: 'UI/Layout/ExpandableList/ExpandableList',
  component: ExpandableList,
  decorators: [ComponentDecorator],
  args: {
    children: [
      <Tag key={1} text={'Option 1'} color={MAIN_COLOR_NAMES[0]} />,
      <Tag key={2} text={'Option 2'} color={MAIN_COLOR_NAMES[1]} />,
      <Tag key={3} text={'Option 3'} color={MAIN_COLOR_NAMES[2]} />,
      <Tag key={4} text={'Option 4'} color={MAIN_COLOR_NAMES[3]} />,
      <Tag key={5} text={'Option 5'} color={MAIN_COLOR_NAMES[4]} />,
      <Tag key={6} text={'Option 6'} color={MAIN_COLOR_NAMES[5]} />,
      <Tag key={7} text={'Option 7'} color={MAIN_COLOR_NAMES[6]} />,
    ],
    isHovered: undefined,
    reference: undefined,
    forceDisplayHiddenCount: false,
    withDropDownBorder: false,
  },
  argTypes: {
    children: { control: false },
    isHovered: { control: false },
    reference: { control: false },
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const Default: Story = {};
