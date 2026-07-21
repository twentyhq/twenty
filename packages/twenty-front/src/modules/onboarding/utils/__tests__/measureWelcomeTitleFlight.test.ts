import { WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID } from '@/onboarding/constants/WelcomeTitleHandoffTargetElementId';
import { measureWelcomeTitleFlight } from '@/onboarding/utils/measureWelcomeTitleFlight';

const buildSourceElement = () => {
  const source = document.createElement('div');
  source.getBoundingClientRect = () =>
    ({ left: 100, top: 200, width: 400, height: 80 }) as DOMRect;
  document.body.appendChild(source);
  return source;
};

const buildTargetElement = (rect: Partial<DOMRect>, visibility = 'visible') => {
  const target = document.createElement('span');
  target.id = WELCOME_TITLE_HANDOFF_TARGET_ELEMENT_ID;
  target.style.visibility = visibility;
  target.getBoundingClientRect = () =>
    ({ left: 24, top: 40, width: 200, height: 20, ...rect }) as DOMRect;
  document.body.appendChild(target);
  return target;
};

describe('measureWelcomeTitleFlight', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return null when the source element is missing', () => {
    buildTargetElement({});

    expect(measureWelcomeTitleFlight(null)).toBeNull();
  });

  it('should return null when the target element is not in the document', () => {
    expect(measureWelcomeTitleFlight(buildSourceElement())).toBeNull();
  });

  it('should return null when the target has no width', () => {
    const source = buildSourceElement();
    buildTargetElement({ width: 0 });

    expect(measureWelcomeTitleFlight(source)).toBeNull();
  });

  it('should return null when the target has no height', () => {
    const source = buildSourceElement();
    buildTargetElement({ height: 0 });

    expect(measureWelcomeTitleFlight(source)).toBeNull();
  });

  it('should return null when the target is not visible', () => {
    const source = buildSourceElement();
    buildTargetElement({}, 'hidden');

    expect(measureWelcomeTitleFlight(source)).toBeNull();
  });

  it('should measure a flight when the target is laid out and visible', () => {
    const source = buildSourceElement();
    buildTargetElement({});

    expect(measureWelcomeTitleFlight(source)).not.toBeNull();
  });
});
