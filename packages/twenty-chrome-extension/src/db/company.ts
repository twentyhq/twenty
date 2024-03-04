export const fetchCompany = async (linkedinLink: string) => {
    try {
        const localStorage = await chrome.storage.local.get();
        if(localStorage.apiKey && localStorage.serverBaseUrl) {
            const res = await fetch(`${localStorage.serverBaseUrl}/rest/companies`, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                  "Content-Type": "application/json",
                  Authorization : `Bearer ${localStorage.apiKey}`,
                }
            });
            const data = await res.json();
            if (data.companies) {
                const company = data.companies.filter((company: any) => company.linkedinLink.url === linkedinLink)
                return company;
            }
        }
    } catch (error) {
        throw error;
    }
}

export const createCompany = async (company: any) => {
    try {
        const localStorage = await chrome.storage.local.get();
        if(localStorage.apiKey && localStorage.serverBaseUrl) {
            const res = await fetch(`${localStorage.serverBaseUrl}/rest/companies`, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: 'no-cors',
                headers: {
                  "Content-Type": "application/json",
                  Authorization : `Bearer ${localStorage.apiKey}`,
                },
                body: JSON.stringify(company)
            });
            const data = await res.json();
            console.log(data);
            return data;
        }
    } catch (error) {
        throw error;
    }
}