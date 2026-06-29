import ReactDOM from 'react-dom/client';

import { App } from '@/app/components/App';
import { migrateTokenPairCookieToLocalStorage } from '@/auth/utils/migrateTokenPairCookieToLocalStorage';
import { hydrateMetadataStore } from '@/metadata-store/storage/metadataStoreStorage';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import 'twenty-ui/theme-light.css';
import 'twenty-ui/theme-dark.css';
import './index.css';

// TODO: REMOVE this after 2026-12-12 — temporary migration of tokenPair from the
// legacy cookie to localStorage (legacy cookie has a 180-day expiry).
migrateTokenPairCookieToLocalStorage();

const DASHBOARD_PRINT_STYLE_ID = 'twenty-dashboard-print-styles';
const DASHBOARD_PRINT_SNAPSHOT_ID = 'twenty-dashboard-print-snapshot';
const RECORD_INDEX_PRINT_SNAPSHOT_ID = 'twenty-record-index-print-snapshot';

const getElementText = (element: Element | null) =>
  element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

const getWidgetTitle = (widgetElement: Element) =>
  getElementText(widgetElement.querySelector('[data-testid="tooltip"]')) ||
  getElementText(widgetElement).split(' ').slice(0, 8).join(' ');

const getCanvasPrintableContentScore = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');

  if (!context || canvas.width === 0 || canvas.height === 0) {
    return 0;
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  let score = 0;

  for (let index = 0; index < imageData.data.length; index += 16) {
    const red = imageData.data[index] ?? 255;
    const green = imageData.data[index + 1] ?? 255;
    const blue = imageData.data[index + 2] ?? 255;
    const alpha = imageData.data[index + 3] ?? 0;

    if (alpha > 5 && (red < 245 || green < 245 || blue < 245)) {
      score += 1;
    }
  }

  return score;
};

const replaceClonedSvgsWithImages = (
  originalElement: Element,
  clonedElement: Element,
) => {
  const originalSvgs = Array.from(originalElement.querySelectorAll('svg'));
  const clonedSvgs = Array.from(clonedElement.querySelectorAll('svg'));
  const serializer = new XMLSerializer();

  originalSvgs.forEach((svg, index) => {
    const clonedSvg = clonedSvgs[index];

    if (!clonedSvg) {
      return;
    }

    const svgRect = svg.getBoundingClientRect();
    const serializedSvg = svg.cloneNode(true) as SVGSVGElement;
    serializedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    serializedSvg.setAttribute('width', `${Math.max(svgRect.width, 1)}`);
    serializedSvg.setAttribute('height', `${Math.max(svgRect.height, 1)}`);

    const imageElement = document.createElement('img');
    imageElement.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      serializer.serializeToString(serializedSvg),
    )}`;
    imageElement.width = Math.max(Math.round(svgRect.width), 1);
    imageElement.height = Math.max(Math.round(svgRect.height), 1);
    imageElement.className = 'twenty-dashboard-print-svg-image';
    clonedSvg.replaceWith(imageElement);
  });
};

const replaceClonedCanvasesWithImages = (
  originalElement: Element,
  clonedElement: Element,
) => {
  const originalCanvases = Array.from(
    originalElement.querySelectorAll('canvas'),
  );
  const clonedCanvases = Array.from(clonedElement.querySelectorAll('canvas'));

  originalCanvases.forEach((canvas, index) => {
    const clonedCanvas = clonedCanvases[index];

    if (!clonedCanvas) {
      return;
    }

    const imageElement = document.createElement('img');
    imageElement.src = canvas.toDataURL('image/png');
    imageElement.width = canvas.width;
    imageElement.height = canvas.height;
    imageElement.className = 'twenty-dashboard-print-canvas-image';
    clonedCanvas.replaceWith(imageElement);
  });
};

const removeInteractivePrintChrome = (clonedElement: Element) => {
  clonedElement
    .querySelectorAll('button, [role="button"], .react-resizable-handle')
    .forEach((element) => element.remove());
};

const simplifyFrontComponentPrintContent = (
  clonedElement: Element,
  widgetTitle: string,
) => {
  if (
    widgetTitle !== 'Front Component' &&
    !getElementText(clonedElement).includes('EXECUTION CONTEXT')
  ) {
    return;
  }

  const heading = clonedElement.querySelector('h1, h2, h3, h4');
  const contentText = getElementText(heading) ||
    getElementText(clonedElement)
      .replace(/^Front Component\s*/, '')
      .split(' USER ID ')[0]
      .split(' EXECUTION CONTEXT ')[0];

  clonedElement.replaceChildren();

  const headingElement = document.createElement('div');
  headingElement.className = 'twenty-dashboard-print-front-component-content';
  headingElement.textContent = contentText || 'Front Component';
  clonedElement.appendChild(headingElement);
};

const isPrintableWidget = (originalElement: Element, clonedElement: Element) => {
  const text = getElementText(clonedElement);
  const hasVisualContent = Boolean(
    originalElement.querySelector('svg, canvas, img'),
  );
  const title = getWidgetTitle(originalElement);
  const textWithoutTitle = text.replace(title, '').trim();

  return hasVisualContent || textWithoutTitle.length > 0;
};

const buildPrintableWidget = (widgetElement: Element) => {
  const widgetTitle = getWidgetTitle(widgetElement);
  const originalWidgetRect = widgetElement.getBoundingClientRect();
  const largeSvgs = Array.from(widgetElement.querySelectorAll('svg')).filter(
    (svg) => {
      const svgRect = svg.getBoundingClientRect();

      return svgRect.width > 100 && svgRect.height > 80;
    },
  );
  const canvases = Array.from(widgetElement.querySelectorAll('canvas'));

  if (largeSvgs.length > 0 || canvases.length > 0) {
    const cardElement = document.createElement('section');
    cardElement.className = 'twenty-dashboard-print-card';
    cardElement.dataset.widgetTitle = widgetTitle;

    const titleElement = document.createElement('h2');
    titleElement.className = 'twenty-dashboard-print-widget-title';
    titleElement.textContent = widgetTitle;
    cardElement.appendChild(titleElement);

    const chartElement = document.createElement('div');
    chartElement.className = 'twenty-dashboard-print-chart';

    const largestCanvas = canvases
      .filter((canvas) => canvas.width > 100 && canvas.height > 80)
      .sort((leftCanvas, rightCanvas) => {
        const scoreDifference =
          getCanvasPrintableContentScore(rightCanvas) -
          getCanvasPrintableContentScore(leftCanvas);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return (
          rightCanvas.width * rightCanvas.height -
          leftCanvas.width * leftCanvas.height
        );
      })[0];

    if (largestCanvas) {
      const imageElement = document.createElement('img');
      imageElement.src = largestCanvas.toDataURL('image/png');
      imageElement.width = largestCanvas.width;
      imageElement.height = largestCanvas.height;
      imageElement.className = 'twenty-dashboard-print-canvas-image';
      chartElement.appendChild(imageElement);
    }

    if (!largestCanvas) {
      const serializer = new XMLSerializer();
      const largestSvg = largeSvgs.sort((leftSvg, rightSvg) => {
        const leftRect = leftSvg.getBoundingClientRect();
        const rightRect = rightSvg.getBoundingClientRect();

        return rightRect.width * rightRect.height - leftRect.width * leftRect.height;
      })[0];

      if (largestSvg) {
        const svgRect = largestSvg.getBoundingClientRect();
        const serializedSvg = largestSvg.cloneNode(true) as SVGSVGElement;
        serializedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        serializedSvg.setAttribute('width', `${Math.max(svgRect.width, 1)}`);
        serializedSvg.setAttribute('height', `${Math.max(svgRect.height, 1)}`);

        const imageElement = document.createElement('img');
        imageElement.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          serializer.serializeToString(serializedSvg),
        )}`;
        imageElement.width = Math.max(Math.round(svgRect.width), 1);
        imageElement.height = Math.max(Math.round(svgRect.height), 1);
        imageElement.className = 'twenty-dashboard-print-svg-image';
        chartElement.appendChild(imageElement);
      }
    }

    cardElement.appendChild(chartElement);

    const legendText = getElementText(widgetElement)
      .match(/Meeting|New|Proposal|Screening|Customer/g)
      ?.filter((value, index, array) => array.indexOf(value) === index)
      .join(' · ');

    if (legendText) {
      const legendElement = document.createElement('div');
      legendElement.className = 'twenty-dashboard-print-legend';
      legendElement.textContent = legendText;
      cardElement.appendChild(legendElement);
    }

    return cardElement;
  }

  const clonedWidgetElement = widgetElement.cloneNode(true) as HTMLElement;
  const hasChartContent = Boolean(widgetElement.querySelector('svg, canvas'));

  clonedWidgetElement.style.width = '100%';
  clonedWidgetElement.style.height = hasChartContent
    ? `${Math.min(Math.max(originalWidgetRect.height, 260), 420)}px`
    : 'auto';
  clonedWidgetElement.style.minHeight = hasChartContent ? '260px' : '0';

  removeInteractivePrintChrome(clonedWidgetElement);
  replaceClonedSvgsWithImages(widgetElement, clonedWidgetElement);
  replaceClonedCanvasesWithImages(widgetElement, clonedWidgetElement);
  simplifyFrontComponentPrintContent(clonedWidgetElement, widgetTitle);

  if (!isPrintableWidget(widgetElement, clonedWidgetElement)) {
    return null;
  }

  const cardElement = document.createElement('section');
  cardElement.className = 'twenty-dashboard-print-card';
  cardElement.dataset.widgetTitle = widgetTitle;
  cardElement.appendChild(clonedWidgetElement);

  return cardElement;
};

const refreshDashboardPrintSnapshot = () => {
  document.getElementById(DASHBOARD_PRINT_SNAPSHOT_ID)?.remove();
  document.body.classList.remove('twenty-dashboard-printing');

  const dashboardWidgets = Array.from(
    document.querySelectorAll('.react-grid-layout > .react-grid-item'),
  ).sort((leftElement, rightElement) => {
    const leftRect = leftElement.getBoundingClientRect();
    const rightRect = rightElement.getBoundingClientRect();

    return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
  });

  if (dashboardWidgets.length === 0) {
    return;
  }

  const snapshotElement = document.createElement('main');
  snapshotElement.id = DASHBOARD_PRINT_SNAPSHOT_ID;

  const titleElement = document.createElement('h1');
  titleElement.textContent = document.title.replace(' - Dashboard', '');
  snapshotElement.appendChild(titleElement);

  const gridElement = document.createElement('div');
  gridElement.className = 'twenty-dashboard-print-grid';

  dashboardWidgets.forEach((widgetElement) => {
    const printableWidget = buildPrintableWidget(widgetElement);

    if (printableWidget) {
      gridElement.appendChild(printableWidget);
    }
  });

  snapshotElement.appendChild(gridElement);
  document.body.prepend(snapshotElement);
  document.body.classList.add('twenty-dashboard-printing');
};

const clearDashboardPrintSnapshot = () => {
  document.getElementById(DASHBOARD_PRINT_SNAPSHOT_ID)?.remove();
  document.body.classList.remove('twenty-dashboard-printing');
};

const getRecordFieldIndex = (element: Element) => {
  const className = String(element.className);
  const match = className.match(/record-table-column-field-(\d+)/);

  return match ? Number(match[1]) : null;
};

const getRecordCellText = (element: Element) =>
  getElementText(element).replace(/^[A-Z]\s+(?=[A-Z])/u, '');

const buildRecordIndexPrintSnapshot = (applyPrintIsolation = false) => {
  document.getElementById(RECORD_INDEX_PRINT_SNAPSHOT_ID)?.remove();
  document.body.classList.remove('twenty-record-index-printing');

  const fieldHeaders = Array.from(
    document.querySelectorAll('.header-cell[class*="record-table-column-field-"]'),
  )
    .map((element) => ({
      index: getRecordFieldIndex(element),
      text: getElementText(element),
    }))
    .filter(
      (header): header is { index: number; text: string } =>
        header.index !== null && header.text.length > 0,
    )
    .sort((leftHeader, rightHeader) => leftHeader.index - rightHeader.index);

  const fieldCells = Array.from(
    document.querySelectorAll('.table-cell[class*="record-table-column-field-"]'),
  )
    .map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        index: getRecordFieldIndex(element),
        text: getRecordCellText(element),
        top: Math.round(rect.top),
      };
    })
    .filter(
      (cell): cell is { index: number; text: string; top: number } =>
        cell.index !== null && cell.text.length > 0,
    );

  if (fieldHeaders.length === 0 || fieldCells.length === 0) {
    return;
  }

  const rowsByTop = new Map<number, Array<{ index: number; text: string }>>();

  fieldCells.forEach(({ index, text, top }) => {
    const rowTop = [...rowsByTop.keys()].find(
      (existingTop) => Math.abs(existingTop - top) <= 2,
    ) ?? top;

    rowsByTop.set(rowTop, [
      ...(rowsByTop.get(rowTop) ?? []),
      { index, text },
    ]);
  });

  const rows = [...rowsByTop.entries()]
    .sort(([leftTop], [rightTop]) => leftTop - rightTop)
    .map(([, rowCells]) =>
      fieldHeaders.map(({ index }) =>
        rowCells.find((cell) => cell.index === index)?.text ?? '',
      ),
    )
    .filter((rowValues) => rowValues.some((value) => value.length > 0))
    .slice(0, 40);

  if (rows.length === 0) {
    return;
  }

  const snapshotElement = document.createElement('main');
  snapshotElement.id = RECORD_INDEX_PRINT_SNAPSHOT_ID;

  const titleElement = document.createElement('h1');
  titleElement.textContent = document.title;
  snapshotElement.appendChild(titleElement);

  const tableElement = document.createElement('table');
  const tableHeadElement = document.createElement('thead');
  const headerRowElement = document.createElement('tr');

  fieldHeaders.forEach(({ text }) => {
    const headerCellElement = document.createElement('th');
    headerCellElement.textContent = text;
    headerRowElement.appendChild(headerCellElement);
  });

  tableHeadElement.appendChild(headerRowElement);
  tableElement.appendChild(tableHeadElement);

  const tableBodyElement = document.createElement('tbody');

  rows.forEach((rowValues) => {
    const rowElement = document.createElement('tr');

    rowValues.forEach((value) => {
      const cellElement = document.createElement('td');
      cellElement.textContent = value;
      rowElement.appendChild(cellElement);
    });

    tableBodyElement.appendChild(rowElement);
  });

  tableElement.appendChild(tableBodyElement);
  snapshotElement.appendChild(tableElement);
  document.body.prepend(snapshotElement);

  if (applyPrintIsolation) {
    Array.from(document.body.children).forEach((childElement) => {
      if (childElement.id === RECORD_INDEX_PRINT_SNAPSHOT_ID) {
        return;
      }

      const htmlChildElement = childElement as HTMLElement;
      htmlChildElement.dataset.twentyPrintPreviousDisplay =
        htmlChildElement.style.display;
      htmlChildElement.style.setProperty('display', 'none', 'important');
    });

    document.documentElement.style.setProperty('height', 'auto', 'important');
    document.documentElement.style.setProperty('min-height', '0', 'important');
    document.documentElement.style.setProperty('overflow', 'visible', 'important');
    document.body.style.setProperty('height', 'auto', 'important');
    document.body.style.setProperty('min-height', '0', 'important');
    document.body.style.setProperty('overflow', 'visible', 'important');
    document.body.style.setProperty('background', '#fff', 'important');
  }

  document.body.classList.add('twenty-record-index-printing');
};

const clearRecordIndexPrintSnapshot = () => {
  Array.from(document.body.children).forEach((childElement) => {
    if (childElement.id === RECORD_INDEX_PRINT_SNAPSHOT_ID) {
      return;
    }

    const htmlChildElement = childElement as HTMLElement;

    if ('twentyPrintPreviousDisplay' in htmlChildElement.dataset) {
      htmlChildElement.style.display =
        htmlChildElement.dataset.twentyPrintPreviousDisplay ?? '';
      delete htmlChildElement.dataset.twentyPrintPreviousDisplay;
    }
  });

  document.getElementById(RECORD_INDEX_PRINT_SNAPSHOT_ID)?.remove();
  document.body.classList.remove('twenty-record-index-printing');
  document.documentElement.style.height = '';
  document.documentElement.style.minHeight = '';
  document.documentElement.style.overflow = '';
  document.body.style.height = '';
  document.body.style.minHeight = '';
  document.body.style.overflow = '';
  document.body.style.background = '';
};

const applyDashboardPrintStyles = () => {
  document.getElementById(DASHBOARD_PRINT_STYLE_ID)?.remove();

  const styleElement = document.createElement('style');
  styleElement.id = DASHBOARD_PRINT_STYLE_ID;
  styleElement.textContent = `
    #${DASHBOARD_PRINT_SNAPSHOT_ID},
    #${RECORD_INDEX_PRINT_SNAPSHOT_ID} {
      display: none;
    }

    @media print {
      body.twenty-dashboard-printing {
        background: #fff !important;
      }

      body.twenty-dashboard-printing #root {
        display: none !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} {
        color: #111 !important;
        display: block !important;
        font-family: Inter, Arial, sans-serif !important;
        font-size: 12px !important;
        line-height: 1.35 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} h1 {
        color: #111 !important;
        font-size: 20px !important;
        font-weight: 600 !important;
        margin: 0 0 14px 0 !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-grid {
        align-items: stretch !important;
        display: grid !important;
        gap: 12px !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-card {
        background: #fff !important;
        border: 1px solid #ddd !important;
        border-radius: 8px !important;
        break-inside: avoid !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-card[data-widget-title="Revenue Forecast"],
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-card[data-widget-title="Pipeline Value by Close Date (Stacked by Stage)"],
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-card[data-widget-title="Contact Roles"] {
        grid-column: 1 / -1 !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} *,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} svg,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} canvas,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} img {
        max-width: 100% !important;
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .react-grid-item,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .widget {
        display: flex !important;
        min-height: 0 !important;
        overflow: hidden !important;
        position: static !important;
        width: 100% !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .react-grid-item {
        margin: 0 !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .widget {
        background: #fff !important;
        border: 0 !important;
        border-radius: 8px !important;
        height: 100% !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-front-component-content {
        color: #0369a1 !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        padding: 16px !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-widget-title {
        color: #222 !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        margin: 0 !important;
        padding: 12px 12px 4px 12px !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-chart {
        padding: 4px 12px 8px 12px !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-legend {
        color: #555 !important;
        font-size: 11px !important;
        padding: 0 12px 12px 12px !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-canvas-image,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-svg-image {
        display: block !important;
        height: auto !important;
        width: auto !important;
      }

      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-chart .twenty-dashboard-print-canvas-image,
      body.twenty-dashboard-printing #${DASHBOARD_PRINT_SNAPSHOT_ID} .twenty-dashboard-print-chart .twenty-dashboard-print-svg-image {
        width: 100% !important;
      }

      body.twenty-record-index-printing {
        background: #fff !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      html:has(body.twenty-record-index-printing) {
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
      }

      body.twenty-record-index-printing > *:not(#${RECORD_INDEX_PRINT_SNAPSHOT_ID}) {
        display: none !important;
      }

      body.twenty-record-index-printing #root {
        display: none !important;
      }

      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} {
        break-after: avoid !important;
        color: #111 !important;
        display: block !important;
        font-family: Inter, Arial, sans-serif !important;
        font-size: 9px !important;
        height: auto !important;
        line-height: 1.25 !important;
        margin: 0 !important;
        min-height: 0 !important;
        overflow: visible !important;
        padding: 0 !important;
        page-break-after: avoid !important;
        position: static !important;
        width: 100% !important;
      }

      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} h1 {
        font-size: 18px !important;
        margin: 0 0 12px 0 !important;
      }

      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} table {
        border-collapse: collapse !important;
        table-layout: fixed !important;
        width: 100% !important;
      }

      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} th,
      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} td {
        border: 1px solid #ddd !important;
        padding: 4px !important;
        text-align: left !important;
        vertical-align: top !important;
        word-break: break-word !important;
      }

      body.twenty-record-index-printing #${RECORD_INDEX_PRINT_SNAPSHOT_ID} th {
        background: #f5f5f5 !important;
        font-weight: 600 !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
};

const preparePrint = () => {
  clearRecordIndexPrintSnapshot();

  if (document.querySelector('.react-grid-layout > .react-grid-item')) {
    if (!document.getElementById(DASHBOARD_PRINT_SNAPSHOT_ID)) {
      refreshDashboardPrintSnapshot();
    }

    document.body.classList.add('twenty-dashboard-printing');
    applyDashboardPrintStyles();

    return;
  }

  clearDashboardPrintSnapshot();
  buildRecordIndexPrintSnapshot(true);
  applyDashboardPrintStyles();
};

const refreshDashboardPrintSnapshotIfScreen = () => {
  if (window.matchMedia('print').matches) {
    return;
  }

  if (!document.querySelector('.react-grid-layout > .react-grid-item')) {
    return;
  }

  refreshDashboardPrintSnapshot();
};

const refreshRecordIndexPrintSnapshotIfScreen = () => {
  if (window.matchMedia('print').matches) {
    return;
  }

  if (document.querySelector('.react-grid-layout > .react-grid-item')) {
    return;
  }

  if (!document.querySelector('.header-cell[class*="record-table-column-field-"]')) {
    clearRecordIndexPrintSnapshot();
    return;
  }

  buildRecordIndexPrintSnapshot(false);
};

const installDashboardPrintStyles = () => {
  applyDashboardPrintStyles();
  setTimeout(refreshDashboardPrintSnapshotIfScreen, 1000);
  setTimeout(refreshRecordIndexPrintSnapshotIfScreen, 1000);
  window.setInterval(refreshDashboardPrintSnapshotIfScreen, 2000);
  window.setInterval(refreshRecordIndexPrintSnapshotIfScreen, 2000);
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', () => {
    clearDashboardPrintSnapshot();
    clearRecordIndexPrintSnapshot();
  });
  window.matchMedia('print').addEventListener('change', (event) => {
    if (event.matches) {
      preparePrint();
    } else {
      clearDashboardPrintSnapshot();
      clearRecordIndexPrintSnapshot();
    }
  });
};

const renderApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') ?? document.body,
  );

  root.render(<App />);
  setTimeout(installDashboardPrintStyles, 0);
};

hydrateMetadataStore().then(renderApp, renderApp);
