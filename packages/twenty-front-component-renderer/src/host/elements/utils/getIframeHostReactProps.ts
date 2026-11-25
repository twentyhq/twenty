import { isBoolean, isString } from '@sniptt/guards';

import { type FrontComponentIframeHostProps } from '@/host/elements/types/FrontComponentIframeHostProps';

const getString = (value: unknown) => (isString(value) ? value : undefined);

export const getIframeHostReactProps = (
  props: Record<string, unknown>,
): FrontComponentIframeHostProps['iframeProps'] => ({
  src: getString(props.src),
  srcDoc: getString(props.srcDoc),
  hidden: isBoolean(props.hidden) ? props.hidden : undefined,
  sandbox: getString(props.sandbox),
  allow: getString(props.allow),
});
