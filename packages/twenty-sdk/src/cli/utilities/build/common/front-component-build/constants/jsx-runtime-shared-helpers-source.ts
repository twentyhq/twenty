export const JSX_RUNTIME_SHARED_HELPERS_SOURCE = `
export var customElementMap = globalThis.__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__ || {};

var _injectedStyleKeys = {};

export function injectStyleViaHead(cssText) {
  if (!cssText) return;
  var hash = 0;
  for (var i = 0; i < cssText.length; i++) {
    hash = ((hash << 5) - hash + cssText.charCodeAt(i)) | 0;
  }
  var key = 'jsx-style-' + hash;
  if (_injectedStyleKeys[key]) return;
  _injectedStyleKeys[key] = true;
  var el = document.createElement('style');
  el.setAttribute('data-jsx-style', key);
  el.textContent = cssText;
  document.head.appendChild(el);
}

export function extractCssText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children))
    return children
      .filter(function (c) { return typeof c === 'string'; })
      .join('');
  return '';
}

var _reactToDomEvent = {
  ondoubleclick: 'ondblclick',
};

function _isEventProp(name) {
  return (
    name.length > 2 &&
    name.charCodeAt(0) === 111 &&
    name.charCodeAt(1) === 110 &&
    name.charCodeAt(2) >= 65 &&
    name.charCodeAt(2) <= 90
  );
}

export function splitEventProps(props) {
  if (!props) return { cleanProps: props, events: null };
  var events = null;
  var cleanProps = null;
  for (var k in props) {
    if (_isEventProp(k) && typeof props[k] === 'function') {
      if (!events) {
        events = {};
        cleanProps = {};
        for (var j in props) {
          if (j === k) break;
          cleanProps[j] = props[j];
        }
      }
      events[k] = props[k];
    } else if (events) {
      cleanProps[k] = props[k];
    }
  }
  return { cleanProps: cleanProps || props, events: events };
}

var _customElementTags = {};
for (var _htmlTag in customElementMap) {
  _customElementTags[customElementMap[_htmlTag]] = true;
}

export function isCustomElementTag(type) {
  return typeof type === 'string' && _customElementTags[type] === true;
}

var _captureSuffix = 'Capture';
var _pointerCaptureEventSuffix = 'PointerCapture';

function _toEventListenerDescriptor(propName) {
  var isCapture =
    propName.slice(-_captureSuffix.length) === _captureSuffix &&
    propName.slice(-_pointerCaptureEventSuffix.length) !== _pointerCaptureEventSuffix;
  var bubblePropName = isCapture
    ? propName.slice(0, -_captureSuffix.length)
    : propName;
  var domName =
    _reactToDomEvent[bubblePropName.toLowerCase()] ||
    bubblePropName.toLowerCase();
  var type = domName.slice(2);
  return {
    key: isCapture ? type + ':capture' : type,
    type: type,
    capture: isCapture,
  };
}

var _eventListenerEntriesByElement = new WeakMap();

function _createElementEventListener(entry) {
  return function (event) {
    var jsxHandler = entry.handlersBySource.jsx;
    var cloneHandler = entry.handlersBySource.clone;
    var mergesClonedHandler =
      !!jsxHandler &&
      !!cloneHandler &&
      event != null &&
      typeof event === 'object' &&
      'nativeEvent' in event;
    if (mergesClonedHandler) {
      event.preventBaseUIHandler = function () {
        event.baseUIHandlerPrevented = true;
      };
    }
    if (jsxHandler) jsxHandler.call(this, event);
    if (cloneHandler && !(mergesClonedHandler && event.baseUIHandlerPrevented)) {
      cloneHandler.call(this, event);
    }
  };
}

function _registerElementEventHandlers(el, events, source) {
  var entriesByKey = _eventListenerEntriesByElement.get(el);
  if (!entriesByKey) {
    if (Object.keys(events).length === 0) return;
    entriesByKey = {};
    _eventListenerEntriesByElement.set(el, entriesByKey);
  }
  var currentKeys = {};
  for (var name in events) {
    var descriptor = _toEventListenerDescriptor(name);
    currentKeys[descriptor.key] = true;
    var entry = entriesByKey[descriptor.key];
    if (!entry) {
      entry = {
        type: descriptor.type,
        capture: descriptor.capture,
        handlersBySource: {},
      };
      entry.listener = _createElementEventListener(entry);
      entriesByKey[descriptor.key] = entry;
      el.addEventListener(entry.type, entry.listener, entry.capture);
    }
    entry.handlersBySource[source] = events[name];
  }
  for (var key in entriesByKey) {
    var registeredEntry = entriesByKey[key];
    if (currentKeys[key] || !registeredEntry.handlersBySource[source]) continue;
    delete registeredEntry.handlersBySource[source];
    if (registeredEntry.handlersBySource.jsx || registeredEntry.handlersBySource.clone) {
      continue;
    }
    delete entriesByKey[key];
    el.removeEventListener(
      registeredEntry.type,
      registeredEntry.listener,
      registeredEntry.capture,
    );
  }
}

function _applyUserRef(userRef, el) {
  if (typeof userRef === 'function') return userRef(el);
  if (userRef != null && typeof userRef === 'object') userRef.current = el;
  return undefined;
}

var _elementAttachingCloneEventRef = null;

function _applyUserRefOfEventRef(userRef, el, source) {
  if (source !== 'clone') return _applyUserRef(userRef, el);
  var previousElementAttachingCloneEventRef = _elementAttachingCloneEventRef;
  _elementAttachingCloneEventRef = el;
  try {
    return _applyUserRef(userRef, el);
  } finally {
    _elementAttachingCloneEventRef = previousElementAttachingCloneEventRef;
  }
}

function _createEventRef(events, userRef, source) {
  var eventRef = function (el) {
    if (el) {
      _registerElementEventHandlers(el, events, source);
    }
    if (el && source === 'jsx' && _elementAttachingCloneEventRef !== el) {
      _registerElementEventHandlers(el, {}, 'clone');
    }
    var userRefCleanup = _applyUserRefOfEventRef(userRef, el, source);
    if (el && typeof userRefCleanup === 'function') return userRefCleanup;
    return undefined;
  };
  eventRef._eventProps = events;
  eventRef._userRef = userRef;
  eventRef._eventSource = source;
  return eventRef;
}

var _eventRefsWithoutHandlersBySource = { jsx: new WeakMap(), clone: new WeakMap() };
var _eventRefWithoutHandlersOrUserRefBySource = {};

export function makeEventRef(events, userRef, source) {
  if (events) return _createEventRef(events, userRef, source);
  if (userRef == null) {
    if (!_eventRefWithoutHandlersOrUserRefBySource[source]) {
      _eventRefWithoutHandlersOrUserRefBySource[source] = _createEventRef(
        {},
        null,
        source,
      );
    }
    return _eventRefWithoutHandlersOrUserRefBySource[source];
  }
  var eventRefsByUserRef = _eventRefsWithoutHandlersBySource[source];
  var eventRef = eventRefsByUserRef.get(userRef);
  if (!eventRef) {
    eventRef = _createEventRef({}, userRef, source);
    eventRefsByUserRef.set(userRef, eventRef);
  }
  return eventRef;
}

export function withJsxEventRef(props) {
  var split = splitEventProps(props);
  var cleanProps = split.events ? split.cleanProps : Object.assign({}, props);
  cleanProps.ref = makeEventRef(split.events, cleanProps.ref, 'jsx');
  return cleanProps;
}

export function withCloneEventRef(element, config, readsElementRefFromVnode) {
  var split = splitEventProps(config);
  var cleanConfig = split.events ? split.cleanProps : Object.assign({}, config);
  var configOverridesRef =
    config != null &&
    (readsElementRefFromVnode ? !!config.ref : config.ref !== undefined);
  var baseRef = configOverridesRef
    ? config.ref
    : readsElementRefFromVnode
      ? element.ref
      : element.props.ref;
  var nestedCloneRef =
    baseRef != null && baseRef._eventSource === 'clone' ? baseRef : null;
  var events = nestedCloneRef
    ? Object.assign({}, nestedCloneRef._eventProps, split.events)
    : split.events;
  cleanConfig.ref = makeEventRef(
    events,
    nestedCloneRef ? nestedCloneRef._userRef : baseRef,
    'clone',
  );
  return cleanConfig;
}
`.trim();
