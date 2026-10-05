export const PREACT_REF_COMPAT_SOURCE = `
import { createElement, options } from 'preact';
import { useLayoutEffect } from 'preact/hooks';
import 'preact/compat';

const PREACT_BEFORE_DIFF_OPTION_NAME = '__b';

let adjustedRefVNode = null;
let adjustedRef = null;
let refRestoredAfterPreactReadsIt = null;
let isAdjustedRefRestoreScheduled = false;

function removedRefPlaceholder() {}

function isFunctionComponentType(type) {
  if (typeof type !== 'function') {
    return false;
  }

  const isClassComponentType =
    type.prototype != null && typeof type.prototype.render === 'function';
  return !isClassComponentType;
}

function restoreAdjustedRef() {
  const vnode = adjustedRefVNode;
  if (vnode === null) {
    return;
  }

  adjustedRefVNode = null;
  if (vnode.ref === adjustedRef) {
    vnode.ref = refRestoredAfterPreactReadsIt;
  }
}

function scheduleAdjustedRefRestore() {
  if (isAdjustedRefRestoreScheduled) {
    return;
  }

  isAdjustedRefRestoreScheduled = true;
  Promise.resolve().then(function () {
    isAdjustedRefRestoreScheduled = false;
    restoreAdjustedRef();
  });
}

function adjustRefUntilPreactReadsIt(vnode, ref, refToRestore) {
  adjustedRefVNode = vnode;
  adjustedRef = ref;
  refRestoredAfterPreactReadsIt = refToRestore;
  vnode.ref = ref;
  scheduleAdjustedRefRestore();
}

function hideFunctionComponentRefFromPreact(vnode) {
  const hasRef = vnode.ref != null || vnode.props.ref != null;
  if (!hasRef) {
    return;
  }

  adjustRefUntilPreactReadsIt(vnode, null, vnode.props.ref);
}

function letPreactDetachRemovedRef(vnode) {
  if (vnode.ref != null) {
    return;
  }

  adjustRefUntilPreactReadsIt(vnode, removedRefPlaceholder, vnode.ref);
}

function restoreAdjustedRefBeforePreactReadsAnotherVNode() {
  if (adjustedRefVNode !== null) {
    restoreAdjustedRef();
  }
}

const previousVNodeHook = options.vnode;
options.vnode = function (vnode) {
  restoreAdjustedRefBeforePreactReadsAnotherVNode();
  if (previousVNodeHook) {
    previousVNodeHook(vnode);
  }

  if (vnode.ref != null && isFunctionComponentType(vnode.type)) {
    vnode.props.ref = vnode.ref;
  }
};

const previousBeforeDiffHook = options[PREACT_BEFORE_DIFF_OPTION_NAME];
options[PREACT_BEFORE_DIFF_OPTION_NAME] = function (vnode) {
  restoreAdjustedRefBeforePreactReadsAnotherVNode();
  if (previousBeforeDiffHook) {
    previousBeforeDiffHook(vnode);
  }
};

const previousDiffedHook = options.diffed;
options.diffed = function (vnode) {
  restoreAdjustedRefBeforePreactReadsAnotherVNode();
  if (previousDiffedHook) {
    previousDiffedHook(vnode);
  }

  if (isFunctionComponentType(vnode.type)) {
    hideFunctionComponentRefFromPreact(vnode);
    return;
  }

  if (vnode.type != null) {
    letPreactDetachRemovedRef(vnode);
  }
};

const previousUnmountHook = options.unmount;
options.unmount = function (vnode) {
  restoreAdjustedRefBeforePreactReadsAnotherVNode();
  if (previousUnmountHook) {
    previousUnmountHook(vnode);
  }

  if (isFunctionComponentType(vnode.type)) {
    hideFunctionComponentRefFromPreact(vnode);
  }
};

export function normalizeClonedElementRef({ element, clonedElement, config }) {
  const clearsElementRef =
    clonedElement !== element && config != null && config.ref === null;
  if (!clearsElementRef) {
    return clonedElement;
  }

  clonedElement.ref = null;
  if (clonedElement.props.ref != null) {
    clonedElement.props.ref = null;
  }
  return clonedElement;
}

function isIgnoredPropName(propName) {
  return propName === '__source';
}

function havePropsChanged(previousProps, nextProps) {
  for (const previousPropName in previousProps) {
    if (!isIgnoredPropName(previousPropName) && !(previousPropName in nextProps)) {
      return true;
    }
  }

  for (const nextPropName in nextProps) {
    if (isIgnoredPropName(nextPropName)) {
      continue;
    }

    const isNewOrChangedProp =
      !(nextPropName in previousProps) ||
      !Object.is(previousProps[nextPropName], nextProps[nextPropName]);
    if (isNewOrChangedProp) {
      return true;
    }
  }

  return false;
}

export function memo(component, arePropsEqual) {
  function shouldMemoizedComponentUpdate(nextProps) {
    if (typeof arePropsEqual !== 'function') {
      return havePropsChanged(this.props, nextProps);
    }

    return (
      !arePropsEqual(this.props, nextProps) || this.props.ref !== nextProps.ref
    );
  }

  function Memo(props) {
    this.shouldComponentUpdate = shouldMemoizedComponentUpdate;
    return createElement(component, props);
  }

  Memo.displayName = 'Memo(' + (component.displayName || component.name) + ')';
  Memo.prototype.isReactComponent = true;
  Memo.type = component;
  return Memo;
}

function attachImperativeHandle(ref, createHandle) {
  if (typeof ref === 'function') {
    const refCleanup = ref(createHandle());
    return function () {
      if (typeof refCleanup === 'function') {
        refCleanup();
        return;
      }

      ref(null);
    };
  }

  if (ref == null) {
    return undefined;
  }

  ref.current = createHandle();
  return function () {
    ref.current = null;
  };
}

export function useImperativeHandle(ref, createHandle, dependencies) {
  useLayoutEffect(
    function () {
      return attachImperativeHandle(ref, createHandle);
    },
    dependencies == null ? dependencies : dependencies.concat(ref),
  );
}
`.trim();
