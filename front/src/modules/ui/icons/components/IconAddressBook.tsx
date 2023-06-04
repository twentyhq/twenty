import { TablerIconsProps } from '@tabler/icons-react';

import { ReactComponent as IconAddressBookRaw } from '../svgs/address-book.svg';

export function IconAddressBook(props: TablerIconsProps): JSX.Element {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? 2;

  return <IconAddressBookRaw height={size} width={size} strokeWidth={stroke} />;
}
