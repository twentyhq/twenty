import { createTextareaIntrinsicScrollHeightMeasurer } from '../createTextareaIntrinsicScrollHeightMeasurer';

const createAutoResizeTextarea = () => {
  const textarea = document.createElement('textarea');

  textarea.value = 'First\nSecond\nThird';
  textarea.rows = 1;
  textarea.style.blockSize = '130px';
  textarea.style.width = '240px';
  document.body.append(textarea);

  return textarea;
};

const findMeasurementTextareas = () =>
  document.body.querySelectorAll<HTMLTextAreaElement>(
    'textarea[aria-hidden="true"]',
  );

describe('createTextareaIntrinsicScrollHeightMeasurer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('should keep elements other than textareas outside intrinsic measurements', () => {
    const measurer = createTextareaIntrinsicScrollHeightMeasurer();
    const element = document.createElement('div');

    expect(measurer.measure(element)).toBeUndefined();
    expect(findMeasurementTextareas()).toHaveLength(0);
  });

  it('should measure current content in a hidden textarea without mutating the source textarea', () => {
    const measurer = createTextareaIntrinsicScrollHeightMeasurer();
    const textarea = createAutoResizeTextarea();
    let measuredTextarea: HTMLTextAreaElement | null = null;
    jest
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: Element) {
        measuredTextarea = this as HTMLTextAreaElement;
        return 64;
      });

    expect(measurer.measure(textarea)).toBe(64);
    expect(textarea.style.blockSize).toBe('130px');
    expect(measuredTextarea).not.toBe(textarea);
    expect(measuredTextarea).toHaveProperty('value', 'First\nSecond\nThird');
    expect(measuredTextarea).toHaveProperty('rows', 1);
    expect(measuredTextarea).toHaveProperty('style.blockSize', 'auto');
    expect(measuredTextarea).toHaveProperty('style.width', '240px');
    expect(measuredTextarea).toHaveProperty('style.visibility', 'hidden');
  });

  it('should reuse one hidden textarea and rewrite only what changed', () => {
    const measurer = createTextareaIntrinsicScrollHeightMeasurer();
    const textarea = createAutoResizeTextarea();

    measurer.measure(textarea);
    const measurementTextarea = findMeasurementTextareas()[0];
    const setProperty = jest.spyOn(measurementTextarea.style, 'setProperty');
    measurer.measure(textarea);

    expect(findMeasurementTextareas()).toHaveLength(1);
    expect(setProperty).not.toHaveBeenCalled();

    textarea.style.width = '140px';
    measurer.measure(textarea);

    expect(setProperty).toHaveBeenCalledTimes(1);
    expect(setProperty).toHaveBeenCalledWith('width', '140px');
    expect(findMeasurementTextareas()).toHaveLength(1);
  });

  it('should refresh intrinsic height when rendered metrics change without a value or style update', () => {
    const measurer = createTextareaIntrinsicScrollHeightMeasurer();
    const textarea = createAutoResizeTextarea();
    jest
      .spyOn(Element.prototype, 'scrollHeight', 'get')
      .mockReturnValueOnce(64)
      .mockReturnValueOnce(96);

    expect(measurer.measure(textarea)).toBe(64);
    expect(measurer.measure(textarea)).toBe(96);
  });

  it('should remove the hidden textarea when disposed and recreate it on the next measurement', () => {
    const measurer = createTextareaIntrinsicScrollHeightMeasurer();
    const textarea = createAutoResizeTextarea();

    measurer.measure(textarea);
    measurer.dispose();

    expect(findMeasurementTextareas()).toHaveLength(0);

    measurer.measure(textarea);

    expect(findMeasurementTextareas()).toHaveLength(1);
  });
});
