import { createDefaultButton } from '~/contentScript/createButton';
import extractCompanyLinkedinLink from '~/contentScript/utils/extractCompanyLinkedinLink';
import extractDomain from '~/contentScript/utils/extractDomain';
import { createCompany, fetchCompany } from '~/db/company.db';
import { CompanyInput } from '~/db/types/company.types';
import { isDefined } from '~/utils/isDefined';

export const checkIfCompanyExists = async () => {
  const { tab: activeTab } = await chrome.runtime.sendMessage({
    action: 'getActiveTab',
  });

  const companyURL = extractCompanyLinkedinLink(activeTab.url);

  return await fetchCompany({
    linkedinLink: {
      url: { eq: companyURL },
      label: { eq: companyURL },
    },
  });
};

export const addCompany = async () => {
  // Extract company-specific data from the DOM
  const companyNameElement = document.querySelector(
    '.org-top-card-summary__title',
  );
  const domainNameElement = document.querySelector(
    '.org-top-card-primary-actions__inner a',
  );
  const addressElement = document.querySelectorAll(
    '.org-top-card-summary-info-list__info-item',
  )[1];
  const employeesNumberElement = document.querySelectorAll(
    '.org-top-card-summary-info-list__info-item',
  )[3];

  // Get the text content or other necessary data from the DOM elements
  const companyName = companyNameElement
    ? companyNameElement.getAttribute('title')
    : '';
  const domainName = extractDomain(
    domainNameElement && domainNameElement.getAttribute('href'),
  );
  const address = addressElement
    ? addressElement.textContent?.trim().replace(/\s+/g, ' ')
    : '';
  const employees = employeesNumberElement
    ? Number(
        employeesNumberElement.textContent
          ?.trim()
          .replace(/\s+/g, ' ')
          .split('-')[0],
      )
    : 0;

  // Prepare company data to send to the backend
  const companyInputData: CompanyInput = {
    name: companyName ?? '',
    domainName: domainName,
    address: address ?? '',
    employees: employees,
  };

  // Extract active tab url using chrome API - an event is triggered here and is caught by background script.
  const { tab: activeTab } = await chrome.runtime.sendMessage({
    action: 'getActiveTab',
  });

  // Convert URLs like https://www.linkedin.com/company/twenty/about/ to https://www.linkedin.com/company/twenty
  const companyURL = extractCompanyLinkedinLink(activeTab.url);
  companyInputData.linkedinLink = { url: companyURL, label: companyURL };

  const company = await createCompany(companyInputData);
  return company;
};

export const insertButtonForCompany = async () => {
  const companyButtonDiv = createDefaultButton(
    'twenty-company-btn',
    async () => {
      if (isDefined(companyButtonDiv)) {
        const companyBtnSpan = companyButtonDiv.getElementsByTagName('span')[0];
        companyBtnSpan.textContent = 'Saving...';
        const company = await addCompany();
        if (isDefined(company)) {
          companyBtnSpan.textContent = 'Saved';
          Object.assign(companyButtonDiv.style, { pointerEvents: 'none' });
        } else {
          companyBtnSpan.textContent = 'Try again';
        }
      }
    },
  );

  const parentDiv: HTMLDivElement | null = document.querySelector(
    '.org-top-card-primary-actions__inner',
  );

  if (isDefined(parentDiv)) {
    Object.assign(companyButtonDiv.style, {
      marginLeft: '.8rem',
      marginTop: '.4rem',
    });
    parentDiv.prepend(companyButtonDiv);
  }

  const companyBtnSpan = companyButtonDiv.getElementsByTagName('span')[0];
  const company = await checkIfCompanyExists();

  if (isDefined(company)) {
    companyBtnSpan.textContent = 'Saved';
    Object.assign(companyButtonDiv.style, { pointerEvents: 'none' });
  } else {
    companyBtnSpan.textContent = 'Add to Twenty';
  }
};
