import { type GeometryWakeSources } from '@/host/geometry/types/GeometryWakeSources';
import { createGeometryWakeSources } from '@/host/geometry/utils/createGeometryWakeSources';

const createdWakeSources: GeometryWakeSources[] = [];

const createPortalFixture = () => {
  const onWake = jest.fn();
  const wakeSources = createGeometryWakeSources(onWake);
  const rootContainer = document.createElement('div');
  const portalLayer = document.createElement('div');
  const portalScroller = document.createElement('div');
  const unrelatedScroller = document.createElement('div');

  portalLayer.append(portalScroller);
  document.body.append(rootContainer, portalLayer, unrelatedScroller);
  wakeSources.setRoot(rootContainer);
  createdWakeSources.push(wakeSources);

  return {
    onWake,
    wakeSources,
    portalLayer,
    portalScroller,
    unrelatedScroller,
  };
};

const dispatchScroll = (target: Element) => {
  target.dispatchEvent(new Event('scroll'));
};

describe('createGeometryWakeSources', () => {
  afterEach(() => {
    for (const wakeSources of createdWakeSources) {
      wakeSources.detachPortalLayerSources();
      wakeSources.detachAllSources();
    }
    createdWakeSources.length = 0;
    document.body.replaceChildren();
  });

  it('should wake when an element inside the attached portal layer scrolls', () => {
    const { onWake, wakeSources, portalLayer, portalScroller } =
      createPortalFixture();

    wakeSources.attachPortalLayerSources(portalLayer);
    dispatchScroll(portalScroller);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('should not wake when an element outside the root and the portal layer scrolls', () => {
    const { onWake, wakeSources, portalLayer, unrelatedScroller } =
      createPortalFixture();

    wakeSources.attachPortalLayerSources(portalLayer);
    dispatchScroll(unrelatedScroller);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('should stop waking on portal scrolls once the portal layer sources are detached', () => {
    const { onWake, wakeSources, portalLayer, portalScroller } =
      createPortalFixture();

    wakeSources.attachPortalLayerSources(portalLayer);
    wakeSources.detachPortalLayerSources();
    dispatchScroll(portalScroller);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('should stop waking on scrolls in a previous portal layer once another portal layer is attached', () => {
    const { onWake, wakeSources, portalLayer, portalScroller } =
      createPortalFixture();
    const nextPortalLayer = document.createElement('div');
    const nextPortalScroller = document.createElement('div');

    nextPortalLayer.append(nextPortalScroller);
    document.body.append(nextPortalLayer);
    wakeSources.attachPortalLayerSources(portalLayer);
    wakeSources.attachPortalLayerSources(nextPortalLayer);
    dispatchScroll(portalScroller);

    expect(onWake).not.toHaveBeenCalled();

    dispatchScroll(nextPortalScroller);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('should keep waking on portal scrolls when the element sources are detached', () => {
    const { onWake, wakeSources, portalLayer, portalScroller } =
      createPortalFixture();

    wakeSources.attachElementSources();
    wakeSources.attachPortalLayerSources(portalLayer);
    wakeSources.detachElementSources();
    dispatchScroll(portalScroller);

    expect(onWake).toHaveBeenCalledTimes(1);
  });
});
