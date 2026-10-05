export const PREACT_REF_COMPAT_SOURCE = `
import { isFunction, isNull, isUndefined } from '@sniptt/guards';
import { options } from 'preact';
import 'preact/compat';

function isFunctionComponent(vnode) {
  var type = vnode?.type;
  return isFunction(type) && !isFunction(type.prototype?.render);
}

export function normalizeClonedFunctionRef({ vnode, config }) {
  if (isFunctionComponent(vnode) && isNull(config?.ref)) {
    vnode.ref = null;
    vnode.props.ref = null;
  }
  return vnode;
}

var previousVNodeHook = options.vnode;
options.vnode = function(vnode) {
  if (isFunction(previousVNodeHook)) previousVNodeHook(vnode);
  if (isFunctionComponent(vnode) && !isNull(vnode.ref) && !isUndefined(vnode.ref)) {
    vnode.props.ref = vnode.ref;
  }
};

var previousDiffedHook = options.diffed;
options.diffed = function(vnode) {
  if (isFunctionComponent(vnode)) vnode.ref = null;
  if (isFunction(previousDiffedHook)) previousDiffedHook(vnode);
};
`.trim();
