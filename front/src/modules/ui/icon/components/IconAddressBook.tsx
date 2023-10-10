import { TablerIconsProps } from '@/ui/icon';

import { ReactComponent as IconAddressBookRaw } from '../assets/address-book.svg';

type IconAddressBookProps = TablerIconsProps;

export const IconAddressBook = (props: IconAddressBookProps): JSX.Element => {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? 2;

  return <IconAddressBookRaw height={size} width={size} strokeWidth={stroke} />;
};
