import React from 'react';
import { TbMoon } from 'react-icons/tb';
import {useColorMode} from '@docusaurus/theme-common';


export default function IconDarkMode(props) {
  const { isDarkTheme } = useColorMode();
  return isDarkTheme ? <TbMoon /> : <></>;
}
