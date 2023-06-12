import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { DropdownMenu } from '../DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/Common/DropdownMenu',
  component: DropdownMenu,
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

const FakeMenuContent = styled.div`
  width: 100%;
  height: 400px;
`;

const FakeBelowContainer = styled.div`
  width: 300px;
  height: 600px;
`;

const MenuAbsolutePositionWrapper = styled.div`
  width: fit-content;
  height: fit-content;

  position: absolute;
`;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <DropdownMenu>
      <FakeMenuContent />
    </DropdownMenu>,
  ),
};

export const WithContentBelow: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <div>
        askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd alskjd alksjd
        alksjd laksjd askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd
        alskjd alksjd alksjd laksjd askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd
        jalksdj alksjd alskjd alksjd alksjd laksjd askjdlaksjdlaksjdlakjsdlkj
        lkajsldkjalskd jalksdj alksjd alskjd alksjd alksjd laksjd
        askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd alskjd alksjd
        alksjd laksjd askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd
        alskjd alksjd alksjd laksjd askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd
        jalksdj alksjd alskjd alksjd alksjd laksjd askjdlaksjdlaksjdlakjsdlkj
      </div>
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <FakeMenuContent />
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};
