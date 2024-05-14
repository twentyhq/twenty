# Generate a private key
# resource "tls_private_key" "private_key" {
#   algorithm = "RSA"
# }

# # Register with ACME
# resource "acme_registration" "reg" {
#   account_key_pem = tls_private_key.private_key.private_key_pem
#   email_address   = local.email_address
# }

# resource "random_password" "cert" {
#   length  = 24
#   special = true
# }

# # Request a certificate
# resource "acme_certificate" "cert" {
#   account_key_pem           = acme_registration.reg.account_key_pem
#   common_name               = local.domain
#   certificate_p12_password = random_password.cert.result
#   dns_challenge {
#     provider = "namecheap"
#     config = {
#       NAMECHEAP_API_USER = local.namecheap_api_user
#       NAMECHEAP_API_KEY = local.env_vars["NAMECHEAP_API_KEY"]
#     }
#   }
# }

# resource "azurerm_app_service_certificate" "cert" {
#   name                = "acme"
#   resource_group_name = azurerm_resource_group.main.name
#   location            = local.location

#   pfx_blob = acme_certificate.cert.certificate_p12
#   password = acme_certificate.cert.certificate_p12_password
# }

# # Create an Azure Key Vault to store the certificate
# resource "azurerm_key_vault" "keyvault" {
#   name                        = "${replace(local.domain, ".", "")}keyvault"
#   location                    = azurerm_resource_group.main.location
#   resource_group_name         = azurerm_resource_group.main.name
#   tenant_id                   = data.azurerm_client_config.current.tenant_id
#   sku_name                    = "standard"
#   soft_delete_retention_days  = 7
# }

# resource "azurerm_key_vault_access_policy" "app_access" {
#   key_vault_id = azurerm_key_vault.keyvault.id
#   tenant_id    = data.azurerm_client_config.current.tenant_id
#   object_id    = data.azurerm_client_config.current.object_id
#   application_id = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"  # I'm not sure how to dynamically retrieve this id
#   depends_on = [azurerm_container_app.day1ai_front]

#   certificate_permissions = [
#     "Get",
#     "List",
#     "Create",
#     "Import",
#     "Delete",
#     "Purge",
#     "ManageContacts",
#     "ManageIssuers",
#     "GetIssuers",
#     "ListIssuers",
#     "SetIssuers",
#     "DeleteIssuers",
#     "Recover"
#   ]
# }


# resource "azurerm_role_assignment" "keyvault_secrets_officer" {
#   scope                = azurerm_key_vault.keyvault.id
#   role_definition_name = "Key Vault Secrets Officer"
#   principal_id         = azurerm_container_app.day1ai_front.identity[0].principal_id
# }

# resource "azurerm_role_assignment" "keyvault_certificates_officer" {
#   scope                = azurerm_key_vault.keyvault.id
#   role_definition_name = "Key Vault Certificates Officer"
#   principal_id         = azurerm_container_app.day1ai_front.identity[0].principal_id
#   certificate_permissions = ["Get", "List"]
# }


# # Upload the certificate to Azure Key Vault
# resource "azurerm_key_vault_certificate" "keyvault_certificate" {
#   name         = "ssl-certificate"
#   key_vault_id = azurerm_key_vault.keyvault.id
#   depends_on = [azurerm_key_vault_access_policy.app_access]

#   certificate {
#     contents = acme_certificate.certificate.certificate_p12
#     password = local.certificate_pasword
#   }

#   certificate_policy {
#     issuer_parameters {
#       name = "Self"
#     }

#     key_properties {
#       exportable = true
#       key_type   = "RSA"
#       key_size   = 2048
#       reuse_key  = true
#     }

#     secret_properties {
#       content_type = "application/x-pkcs12"
#     }
#   }
# }



# output "tenant_id" {
#   value = data.azurerm_client_config.current.tenant_id
#   description = "Tenant ID"
# }

# output "object_id" {
#   value = data.azurerm_client_config.current.object_id
#   description = "Object ID"
# }

# output "container_app_principal_id" {
#   value = azurerm_container_app.day1ai_front.identity.0.principal_id
# }